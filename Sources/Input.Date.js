/*
---
name: Input.Date
description: Add date picker to a date field
authors: AtelierZuppinger:@fingerflow
provides: Input.Date
requires:
  - Input/Anchor
  - MooTools-DatePicker/Picker.Date.Range

...
*/


Input.Date = new Class({

	options: {
		format: '%d %m %Y',
		positionOffset: {x: -44, y: -10},
		pickerClass: 'datepicker_vista',
		useFadeInOut: !Browser.ie
	},
	
	Implements: [Options],
	
	initialize: function(field, form, options){
		
		this.setOptions(options);
		this.field = field;
		this.container = field.getParent('fieldset');
		this.form = form;
		this.isDateSupported = field.get('type') == 'date';
		this.datePicker = new Picker.Date(field, this.options);
		
	},
	
	setInitialValue: function(){
		this.initialValue = this.getValue();
	},
	
	getInitialValue: function(){
		var i = this.initialValue ? this.initialValue : this.getValue();
		return i;
	},
	
	getValue: function(){
		this.datePicker.getInputDate(this.field);
		var date = this.datePicker.date.format('%d-%m-%Y');
		return date;
	},
	getformattedValue: function(){
		return this.getValue();
	},
	restoreValue: function( value, focus ){
		
		if( !this.isDateSupported ){
			this.datePicker.detach( this.field );
			this.field.set('value', value.value );
			this.datePicker.attach( this.field );
		}
		else {
			this.field.set('value', value);
		}
		
		if( focus )
			this.focus.delay(200, this);
	},
	focus: function(){
		this.field.focus();
	}
});