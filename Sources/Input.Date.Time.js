/*
---

name: Input.Date.Time
description: Add date picker to a time field
authors: AtelierZuppinger:@fingerflow
provides: Input.Date.Time
requires:
  - Input/Input.Date

...
*/

Input.Date.Time = new Class({
	
	Extends: Input.Date,
	
	initialize: function(field, form){
		this.parent(field, form, {
			timePicker: true,
			pickOnly: 'time',
			format: '%H:%M'
		});
	},
	
	getValue: function(){
		this.datePicker.getInputDate(this.field);
		var date = this.datePicker.date.format('%H:%M');
		return date;
	}
});