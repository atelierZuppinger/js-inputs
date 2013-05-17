/*
---

name: Input
description: Attach custom behavior to form elements (input, select, textarea)
             Works with different Classes
authors: AtelierZuppinger:@fingerflow
provides: Input
requires:
  - Input/Anchor-After
  - Core/Object
  - Core/Array
  - Form-Placeholder/Form.Placeholder

...
*/


Input = new Class({

	options: {/*
		updateValues: function(){}*/
		handleFormValidation: true
	},
	Binds: ['attach', 'inputChange', 'failValidation', 'formValidate'],
	
	Implements: [Options, Events],

	initialize: function(fields, form, options){
		
		this.setOptions(options);
		
		this.fields = fields;
		this.fieldsets = [];
		this.fieldsToValidate = fields;
		this.form = form;
		this.values = {};
	
		fields.each( this.attach );
		
		
		/*
			FORM VALIDATION
		*/
		if( this.options.handleFormValidation ){
			this.formValidator = new Form.Validator( form,{
				fieldSelectors: 'input, select, textarea, date',
				evaluateOnSubmit: false,
				evaluateFieldsOnChange: false,
				evaluateFieldsOnBlur: false,
				serial: false,
				onElementFail: this.failValidation
			});
	
			this.inputValidator = new InputValidator();
		}

		if( this.options.updateValues ){
			this.addEvent('updateValues', this.options.updateValues);
			this.fireEvent('updateValues', this.getValues());
		}
	},
	
	getObjectFromType: function( customType ){
		
		var subObject = customType.split('.'),
				r = window.Input;
		
		subObject.each( function( customType ){
			if( r[customType] )
				r = r[customType];
			else
				return;
		});
		return r;
		
	},
	/**
	fn: attach()
	description: init the correct input Class according to his data-custom-input-type attribute
	             store the result instance in the object
	@params:
	- field: [HTML Element] the field element
	**/
	attach: function(field){
		
		var inputCustomType = field.get('data-custom-input-type'),
				inputType = field.get('type'),
				inputName = field.get('name'),
				inputTagName = field.get('tag');
		
		// set placeholder on fields
		if( Form.Placeholder && inputName && (inputType=='text' || inputTagName=='textarea') ){
				new Form.Placeholder(name);
		}
		if( !inputCustomType )
			inputCustomType = 'Default';
		
		field.addEvent('change', this.inputChange.pass(field));
		
		var object = this.getObjectFromType(inputCustomType);
		
		
		if( !object || field.retrieve('behavior') )
			return false;
		
		var instance = this.initiateField(object, field);
		
		return instance;

	},
	initiateField: function(object, field, options){
		
		var instance = new object( field, this.form, options );
		
		field.store('behavior', instance);
		this.fieldsets.push( instance );
		
		this.setValues(field);
		
		return instance;
		
	},
	detach: function(field){}
	,
	/**
	fn: inputChange()
	Description: call set values to maintain value variable
	             fire the optionnal updateValues event
	@params:
	- field: [HTML Element]
	**/
	inputChange: function(field){
		this.setValues(field);
	},
	/**
	fn: getValues()
	Description: return the current values
	**/
	getValues: function(){
		
		// filters hidden fields
		var returnedValues = Object.clone(this.values);
		this.fieldsets.each( function(fieldset){
			if( fieldset.hidden || !fieldset.getValue().length || fieldset.getValue().length == undefined){
				delete returnedValues[fieldset.field.get('name')];
			}
		}, this);
		
		returnedValues = Object.filter( returnedValues, function(value, key){
			if( value.length ) return true;
			var values = Object.values(value);
			
			if( values.length )
				values = values.filter( function(v){
					if( v.length )
						return true;
				});
			if( values.length )
				return true;
				
		});
		
		return returnedValues;
	
	},
	/**
	fn: setValues()
	@param:
	- field: [HTML Element]
	**/
	setValues: function(field){
		
		var instance = field.retrieve('behavior'),
				fieldset = field.getParent('fieldset'),
				select = field.getParent('select'),
				name = field.get('name') || field.get('data-az-field-name'),
				thisValues;
		
		if( select ){
			name = select.get('name');
			instance = select.retrieve('behavior');
		}	
		
		if( !name )
			return;
		
		var structure = name.split(/\[|\]/).filter(function(key){
			return key!='';
		});
		
		
		if( structure.length > 1 ){
			if( !this.values[structure[0]] )
				thisValues = this.values[structure[0]] = {};
			else
				thisValues = this.values[structure[0]];
			name = structure[1];
		}	else {
			name = structure.pick();
			thisValues = this.values;
		}

		thisValues[name] = instance.getValue();
		
		this.fireEvent('updateValues', this.getValues() );
		
	},
	
	getInitialValues: function(){
		var values = {};
		
		this.fieldsets.each( function (fieldset){
			values[ fieldset.field.get('name') ] = {
				value: fieldset.getInitialValue()
			};
		});
		
		return values;
		
	},
	/**
	fn: restoreValues()
	Description: re-initiate fields to a specific value
	@params:
	- values: [Object] 
	- focus: [HTML Element]
	**/
	restoreValues: function(values, focus){

		Object.each( values, function(value, key){
			var name = '[name=' + key + ']',
					field = this.form.getElement('input'+ name +', select' + name + ', textarea' + name);
			
			if( field ){
				field.retrieve('behavior').restoreValue( value, key == focus || false );
			}
			
		}, this);
		
	},
	validate: function(){
		
		validation = this.formValidator.validate();
		return validation;
	},
	
	failValidation: function( field, validators ){
		validators.each( function( validator ){
		}, this);
	},
	
	getErrorMessage: function( field, validator ){
		return this.formValidator.getValidator( validator ).getError( field );
	},
	
	showFieldsets: function( fieldsetsToShow ){
		var fieldsets = this.fieldsets;
		
		if( fieldsetsToShow ){
			fieldsets = fieldsets.filter( function (fieldset, index){
				return fieldsetsToShow.contains( index );
			});
		}
			
		
		fieldsets.each( function( fieldset ){
//			this.fieldsToValidate.push( fieldset.fields.each( function(field){ return field; }) );
			fieldset.container.removeClass('hidden');
			fieldset.hidden = false;
		}, this);
		
	}, 
	
	hideFieldsets: function( fieldsetsToHide ){
		var fieldsets = this.fieldsets;

		if( fieldsetsToHide )
			fieldsets = fieldsets.filter( function (fieldset, index){
				return fieldsetsToHide.contains( index );
			});
		
		
		fieldsets.each( function( fieldset, index ){
			fieldset.container.addClass('hidden');
			fieldset.hidden = true;
		}, this);
	}
});