/*
---
name: Input.CheckButton
description: Change css class of input
             IE needs to have class on the label so there is exceptions for it
authors: AtelierZuppinger:@fingerflow
provides: Input.CheckButton
requires:
  - Input
...
*/


Input.CheckButton = new Class({

	options: {},
	Binds: ['storeBehaviour', 'click', 'changeSelected'],
	
	initialize: function(field, form){
		this.field = field;
		this.form = form;
		var selector = 'input[name=' + field.get('name') + ']';
		this.fieldset = form.getElements( selector );
		this.container = field.getParent('fieldset');
		this.labels = this.fieldset.getParents('label').flatten();
		
		this.fieldset.each( this.storeBehaviour );
		
		// Forcing IE label
		
		if( !supportDelegation ){
			this.labels.each( function( label ){
				var labelsInput = label.getElements('input');
				
				if( typeOf(label.getElement('img.hover')) == 'element' )
					label.addEvent('click:relay(*)', this.changeSelected.pass( [labelsInput] ));
				
				if( this.fieldset.length == 1 ){
					//label.addEvent('click', this.changeSelected.pass( labelsInput.get('checked') ? [labelsInput] : [] ));
					label.addEvent('click', (function(){
						
						this.changeSelected( !labelsInput.pick().get('checked') ? [labelsInput] : false );
					
					}).bind(this) );
				}
			}, this);
			
		}
		
		this.fieldset.addEvent( 'change', this.click );
			
		this.selected = this.getSelected();
		
		this.setInitialValue();
		this.changeSelected(this.selected);

	},
	
	setInitialValue: function(){
		this.initialValue = this.getValue();
	},
	
	getInitialValue: function(){
		return this.initialValue;
	},
	
	storeBehaviour: function(radio){
		if( !radio.retrieve('behavior') )
			radio.store('behavior', this);
	},
	
	getLabel: function(id){
		return this.form.getElement('label[for=' + id + ']');
	},
	
	click: function(event){
		
		selected = this.getSelected();
		this.changeSelected( selected );
		
	},
	getSelected: function(){
		
		var selected = this.fieldset.filter( function(item){
			return item.checked;
		});
		
		return selected;
	},
	changeSelected: function(selected){
		
		
		this.fieldset.each( function( field ){
			field.removeEvent('change', this.click);
			field.erase('checked');
			field.addEvent('change', this.click);
		}, this);
		
		this.labels.each( function( label ){
			label.removeClass('checked');
		});
		
		if( selected ){
			selected.each( function(selectItem){
				selectItem.removeEvent('change', this.click);
				selectItem.set('checked', true);
				selectItem.addEvent('change', this.click);
				selectItem.getParent('label').addClass('checked');
			}, this);
		}
	},
	getValue: function(){
		
		var selected = this.getSelected(),
				values = selected.get('data-custom-input-values').pick();
		

		return values != null ? JSON.decode(values.clean()) : selected.get('value');
	},
	getformattedValue: function(){
		return this.getSelected().get('data-custom-input-text');
	},
	restoreValue: function(values, focus){

		var selected = this.fieldset.filter( function(item){
			var isChecked = values.value.contains( item.get('value') );
			if( isChecked )
				item.checked;
			else
				item.erase( 'checked' );
			
			return isChecked;
		});
		
		this.changeSelected( selected );
		
	}
});