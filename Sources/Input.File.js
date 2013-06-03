/*
---

name: Input.File
description: Enable file upload with HTML5 file dropping or oldschool button
authors: AtelierZuppinger:@fingerflow
provides: Input.File
requires:
  - Input/Anchor
  - AZ/AZ.CMS
  - Core/Request.JSON

...
*/


/* 
	file library have to be accessible for some actions

		    INSERT FROM CONTENT
		  select area, select file
	
	on field button click: 
		√ <open file library
		√ highlight this.field
		- notify user: "Choisissez un fichier pour l'ajouter dans la zone en surbrillance"
		√ remove all event:delegatino on .insert buttons
		√ add event:delegation on .insert buttons
	on .insert click:
		√ hide file library
		- hide notification
		√ insert file before field.insert
		- add file datas to field
	
		     INSERT FRON LIBRARY
		   select file, select area
	
	default .insert behavior (select area)
	
	on .insert click:
		√ hide file library
		- store file datas
		- notify user: "Choisissez une zone en surbrillance pour y ajouter ce fichier (idéalement avec image)"
	on highlighted area click:
		- hide notification
		√ insert file before field.insert
		- add file datas to field
*/

Input.File = new Class({

	options: {
		/*onHighlight
			onRemoveHighlight*/
	},
	Binds: ['storeBehaviour','fileUnlinked', 'fileDeletedCompleted', 'openLibrary', 'insertFromContent', 'insertImage', 'prepare_to_add', 'change_file', 'directUpload', 'updateImageFromLibrary', 'updateImageFromContent', 'deleteImage', 'replaceFromContent', 'directUploadFromContent', 'setImage'],
	Implements: [Events, Options],
	
	initialize: function(field, form, options){
		
		this.setOptions(options);
		
		this.field = field;
		var add = this.addNew = field.getElement('.img');
		this.buttons = {
			library: add.getElement('.show-file-manager'),
			finder: add.getElement('.upload-file'),
			add_new: add
		};
		this.loadImage = new Request.JSON({
			url: '/ajax/files/get_single',
			onSuccess: this.setImage
		});
		this.form = form;
		this.fieldName = field.get('data-az-field-name');
		this.insertArea = null;
		
		this.fileList = this.field.getElement('.file-list');
		this.base = this.fileList.getElement('.base');
		
		
		var admin = AZ.instances.cms.Admin;
	
		this.cms = {
			admin: admin,
			library: {
				panel: (admin.panels.filter(
					function(panel){
						return panel.get('id') == "admin-files";
					}
				)).pick(),
				trigger: admin.menus.filter(
					function(menu){
						return menu.get('data-panel-id') == 'admin-files';
					}
				)
			}
		};
		
		// values send to backend
		this.attachedFiles = this.get_initial_values();
		this.detachedFiles = [];
		
		this.buttons.library.addEvent('click', this.insertFromContent );
		this.buttons.finder.addEvent('click', this.directUpload );
		
		this.addEvents({
			highlight: this.prepare_to_add,
			removeHighlight: this.removeHighlight
		});
		this.fileList.addEvents({
			'click:relay(.delete)': this.deleteImage,
			'click:relay(.show-file-manager)': this.replaceFromContent,
			'click:relay(.upload-file)': this.directUploadFromContent
		});
		
		this.storeBehaviour( this.field );
		this.checkAttachmentLimit();

	},
	
	set: function(varName, values){
		
		this.options[varName] = values;
		
	},
	
	get_initial_values: function(){
		
		var imgs = this.fileList.getElements('div[class=attached_file] img');
		return imgs.length ? imgs.get('data-az-file-id') : [];
		
	},
	
	insertFromContent: function(event){
		this.openLibrary();
		this.highlight(event);
		// notify
		// this.cms.admin.setInsertAction
		
		this.cms.library.instance.removeEvents('insertFile');
		this.cms.library.instance.addEvent('insertFile', this.insertImage );
	},
	
	replaceFromContent: function(event){
		this.openLibrary();
		this.highlight(event);
		
		this.cms.library.instance.removeEvents('insertFile');
		this.cms.library.instance.addEvent('insertFile', this.updateImageFromContent );
	},
	
	openLibrary: function(){
		
		this.cms.admin.openSection(this.cms.library.trigger.pick());
		if( !this.cms.library.instance ){
			this.cms.library.instance = this.cms.library.panel.retrieve('instance');
		}
		
	},
	
	directUpload: function(event){
		
		this.insertFromContent(event);
		this.cms.library.instance.openFinder();
		this.cms.library.instance.autoInsert();
		
	},
	
	directUploadFromContent: function(event){
		
		this.replaceFromContent(event);
		this.cms.library.instance.openFinder();
		this.cms.library.instance.autoInsert();
		
	},
	
	highlight: function(event){
		
		this.cms.library.instance.fireEvent('close');
		var btn = event.target,
				zone = btn.getParent('.img') || btn.getParent('.attached_file');
				
		zone.addClass('highlight');
		
	},
	
	highlightAll: function(){
		this.field.addClass('highlight');
	},
	removeHighlight: function(){
		this.field.removeClass('highlight');
		this.field.getElements('.highlight').removeClass('highlight');
		this.removeDropMessage();
	},
	
	setImage: function(imageData){
		
		var img = this.insertArea.getElement('img');
				
		img.set({
			src: imageData.src,
			'data-az-file-id': imageData.id
		});

		this.insertArea.removeClass('base');
		this.insertArea = null;
		this.attachedFiles.push(imageData.id);
		// on insertion
		this.insertSuccess();

		this.checkAttachmentLimit();
		
	},
	
	insertImage: function(imageData){
		
		var div = this.base.clone();
		
		div.inject(this.fileList);
		this.insertArea = div;
		this.loadImage.send(JSON.encode(imageData));
		

	},
	updateImageFromContent: function(imageDatas){
		var highlight = this.getHighlightedContent(),
			id = highlight.getElement('img').get('data-az-file-id');
		this.detachFile(id);
		this.insertArea = highlight;
		this.loadImage.send(JSON.encode(imageDatas));
		
	},
	
	updateImageFromLibrary: function(event){
		if (event.target.get('tag')=='img')
			var img = event.target;
		else
			var img = event.target.getElement('img');
		var id = img.get('data-az-file-id');
		this.detachFile(id);
		this.insertArea = img.getParent('.attached_file');
		this.loadImage.send(JSON.encode(this.imageDatas));
		
	},
	
	deleteImage: function(event){
		var attachedFile = event.target.getParent('.attached_file'),
				img = attachedFile.getElement('img'),
				id = img.get('data-az-file-id');
		
		this.detachFile(id);
		attachedFile.destroy();
		this.checkAttachmentLimit();
		
	},
	
	getHighlightedContent: function(){
		var highlight = this.fileList.getElement('.highlight');
		return highlight;
	},
	
	insertSuccess: function(){
		var lib = this.cms.library.panel.retrieve('instance');
		
		this.field.fireEvent('change');
		lib.fireEvent('close');
		this.detach_add();
		this.removeDropMessage();
		this.cms.admin.closeSections();
	},
	
	prepare_to_add: function(file){
		this.highlightAll();
		this.addDropMessage();
		this.attach_add(file);
	},
	
	addDropMessage: function(){
		this.field.addClass('drop-message');
	},
	removeDropMessage: function(){
		this.field.removeClass('drop-message');
	},
	attach_add: function(image){
		this.buttons.add_new.addEvent('click', this.insertImage.pass(image) );
		
		this.imageDatas = image;
		this.fileList.getElements('.attached_file').addEvent('click', this.updateImageFromLibrary );
	},
	
	detach_add: function(){
		this.buttons.add_new.removeEvents('click' );
		this.imageDatas = null;
		this.fileList.getElements('.attached_file').removeEvents('click');
	},
	
	detachFile: function(imageID){
		this.attachedFiles = this.attachedFiles.filter( function(attachedID){
			return imageID != attachedID;
		});
		this.detachedFiles.push(imageID);
		this.field.fireEvent('change');
	},
	
	
	change_file: function(event){
		var img = event.target.getParent('.attached_file');
		
	},
	
	checkAttachmentLimit: function(){
		
		if( this.options.attachmentLimit ){
			if( this.options.attachmentLimit <= this.attachedFiles.length )
				this.hideNewFile();
			else
				this.showNewFile();
		}
		
	},
	
	hideNewFile: function(){
		this.addNew.addClass('hide');
	},
	
	showNewFile: function(){
		this.addNew.removeClass('hide');
	},
	
	storeBehaviour: function(field){
		if( !field.retrieve('behavior') )
			field.store('behavior', this);
		
	},
	getValue: function(){
		
		if( this.attachedFiles.length || this.detachedFiles.length )
			return {
				linked: this.attachedFiles,
				unlinked: this.detachedFiles
			};
		else
			return false;
	},
	
	getformattedValue: function(){
		return this.getValue();
	},
	restoreValue: function(values, focus){

		this.field.set('value', values);
		
	},
	
	fileUnlinked: function(fileId){
		
		this.fileList.getElement('.readyToRemove').destroy();
		this.attachedFiles = this.attachedFiles.filter( function(file){
			return file != fileId;
		});
		this.dettachedFiles.push(fileId);
		
		this.field.fireEvent('change');
		
	},
	
	fileDeletedCompleted: function( response ){
		if( response.success == true ){
			alert('Fichier supprimé');
		}
	}
	
});