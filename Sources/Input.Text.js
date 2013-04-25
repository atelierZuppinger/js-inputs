/*
---
name: Input.Texts
description: Show a text on top of a field like placeholder. Waits value.length > 0 to hide label.
authors: AtelierZuppinger:@fingerflow
provides: Input.Texts
...
*/


Input.Text = new Class({

	options: {},
	Binds: ['storeBehaviour', 'check_filled_input'],
	
	initialize: function(field, form){
		this.field = field;
		this.form = form;
		this.label = this.getLabel( field.get('id') );
		
		this.storeBehaviour( this.field );
		
		this.form.addEvent('reset', this.onEmpty.pass(this.label) );
		
//		var checkContent = this.check_filled_input.pass(this.field, this.onEmpty, this.onFilled );
		this.label.set('tween', {
			duration: 200
		});
		
		this.field.addEvents({
			focus: this.check_filled_input,
			blur: this.check_filled_input,
			keyup: this.check_filled_input
		});
		
		this.check_filled_input();

	},
	
	storeBehaviour: function(field){
		if( !field.retrieve('behavior') )
			field.store('behavior', this);
	},
	
	getLabel: function(id){
		return this.form.getElement('label[for=' + id + ']');
	},
	getValue: function(){
		return this.field.get('value');
	},
	getformattedValue: function(){
		return this.getValue();
	},
	restoreValue: function(values, focus){

		this.field.set('value', values);
		
	},
	check_filled_input: function(){
		
		if( this.field.value.length > 0 )
			this.onFilled( this.label );
		else{
			if( document.activeElement == this.field )
				this.onFocus( this.label );
			else 
				this.onEmpty( this.label );
		}
	
	},
	onEmpty: function( input ){
		input.fade(1);
	},
	onFilled: function( input ){
		input.fade(0);
	},
	onFocus: function( input ){
		input.fade(.4);
	}
});