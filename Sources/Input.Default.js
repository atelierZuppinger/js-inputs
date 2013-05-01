/*
---
name: Input.Default
description: Show a text on top of a field like placeholder. Waits value.length > 0 to hide label.
authors: AtelierZuppinger:@fingerflow
provides: Input.Default
requires:
  - Input/Anchor
...
*/


Input.Default = new Class({

	options: {},
	Binds: ['storeBehaviour', 'check_filled_input'],
	
	initialize: function(field, form){
		this.field = field;
		this.form = form;
		
		this.storeBehaviour( this.field );
		
		//this.form.addEvent('reset', this.onEmpty.pass );
		

	},
	
	storeBehaviour: function(field){
		if( !field.retrieve('behavior') )
			field.store('behavior', this);
	},
	getValue: function(){
		if( this.field.get('tag') == 'input' || this.field.get('tag') == 'textarea')
			return this.field.get('value');
		else
			return this.getSelected();
	},
	
	getSelected: function(){
		
		var selected = this.field.getElements('option').filter( function(option){
			return option.get('selected');
		});
		return selected.pick().get('value');
	},
	
	getformattedValue: function(){
		return this.getValue();
	},
	restoreValue: function(values, focus){

		this.field.set('value', values);
		
	}
});