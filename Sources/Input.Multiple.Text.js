/*
---
name: Input.Texts
description: Show a text on top of a field like placeholder. Waits value.length > 0 to hide label.
authors: AtelierZuppinger:@fingerflow
provides: Input.Texts
requires:
  - Input
...
*/

Input.Multiple = {};
Input.Multiple.Text = new Class({

	options: {},
	Binds: ['storeBehaviour', 'check_filled_input', 'addField', 'deleteField'],
	
	initialize: function(element, form){
		
		this.field = element;
		this.field.set('name', 'specifications');
		this.form = form;
		
		this.storeBehaviour( element );
		this.base = element.getElement('.base_element');
		this.addButton = element.getElement('button.add');
		
		
		element.addEvents({
			'click:relay(.delete)': this.deleteField
		});
		
		this.addButton.addEvent('click', this.addField );
		
	},
	
	storeBehaviour: function(field){
		if( !field.retrieve('behavior') ){
			field.getElements('input, select, option').each( this.storeBehaviour );
			field.store('behavior', this);
		}
	},
	getValue: function(){
		var fieldsets = this.field.getElements('fieldset'),
				returnedValues = {};
		
		fieldsets.each( function(e){
			if( e.hasClass('base_element'))
				return;
			
			var key = e.getElement('.key').get('value'),
					value = e.getElement('.value').get('value');
			
			returnedValues[key] = value;
			
		});
		return returnedValues;
	},
	getformattedValue: function(){
		return this.getValue();
	},
	restoreValue: function(values, focus){

		this.element.set('value', values);
		
	},
	
	addField: function( ){
		this.base.clone().removeClass('hide').removeClass('base_element').inject( this.addButton, 'before' );
	},
	deleteField: function( event ){
		var fieldset = event.target.getParent('fieldset');
		fieldset.destroy();
		this.field.fireEvent('change');
	}
});