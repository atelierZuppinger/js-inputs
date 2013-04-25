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