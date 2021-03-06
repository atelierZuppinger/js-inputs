/*
---

name: Input.HTML
description: Show a text on top of a field like placeholder. Waits value.length > 0 to hide label.
authors: AtelierZuppinger:@fingerflow
provides: Input.HTML
requires:
  - Input/Anchor
  - Core/Element
  - wysihtml5/wysihtml5-0.4
  - wysihtml5/resize

...
*/


Input.HTML = new Class({

		options: {},
		Binds: ['storeBehaviour', 'check_filled_input', 'load', 'fieldFocus', 'fieldBlur', 'setValue', 'growField'],

		field: null,
		form: null,
		tools: null,
		dialogs: null,
		editor: null,
		iframe: null,

		initialize: function(field, form){
			
			this.field = field;
			this.form = form;
			
			this.storeBehaviour( this.field );
			this.tools = document.getElement('.wysihtml5-toolbar').clone().inject(document.id('admin-bar'));
			this.dialogs = this.tools.getElements('.wysihtml5Dialog');
			
			this.editor = new wysihtml5.Editor(field, {
		    toolbar:        this.tools,
		    stylesheets:    "/GUI/CSS/fonts.css",
		    parserRules:    this.get_parserRules()
		  });
			
			
			this.iframe = new IFrame(this.editor.composer.iframe);
			
			this.editor
				.on('focus:composer', this.fieldFocus)
				.on('focus', this.fieldFocus)
				.on('change', this.setValue)
				.on('blur', this.fieldBlur)
				.on('newword:composer', this.growField)
				.on('destroy:composer', this.growField)
				.on('paste', this.growField)
				.on('load', this.load)
			
			this.form.addEvent('reset', this.onEmpty.pass );
			
		},
		
		get_parserRules: function(){
			var parser_rule = {
				tags: {
					strong: {},
					b:      {},
					i:      {},
					em:     {},
					br:     {},
					p:      {},
					ul:     {},
					ol:     {},
					li:     {},
					h1: {},
					h2: {},
					h3: {},
					a:  {
						set_attributes: {
        					target: "_blank" // optional
      					},
						check_attributes: {
							href:   "url" // important to avoid XSS
						}
					}
				}
			};
			return parser_rule;
		},

		storeBehaviour: function(field){
			if( !field.retrieve('behavior') )
				field.store('behavior', this);
		},

		setValue: function(){
			this.field.fireEvent('change');

		},

		getValue: function(){
			return this.editor.getValue();
		},

		getformattedValue: function(){
			return this.getValue();
		},

		restoreValue: function(values, focus){
			this.field.set('value', values);
		},

		load: function(){
			this.editor.toolbar.hide();
			this.growField();
		},

		onEmpty: function(){
			
		},
		fieldFocus: function(){
			this.editor.toolbar.show();
			this.growField();
		},

		growField: function(){
			this.iframe.autoResizeY();

		},

		fieldBlur: function(){
			this.setValue();
			this.growField();
			if (this.tools.getElement('.wysihtml5-command-dialog-opened')) {
				return;
			}
			this.editor.toolbar.hide();
		}

	});