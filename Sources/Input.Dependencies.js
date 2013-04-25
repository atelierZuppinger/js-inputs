/*
---
name: Input.Dependencies
description: Attach and detach dependencies between fields
Usage in HTML: 
	data-dependencies="
		{
			'element': 'select of depending element',
			'function': 'function declared in your class options functions'
		}"
authors: AtelierZuppinger:@fingerflow
provides: Input.Dependencies
requires:
  - Input
...
*/




Input.Dependencies = new Class({

	options: {/*
		updateValues: function(){}
		fn(){},
		fn(){},
		... any function you'd like to use as dependency checker
	*/
	},
	Binds: ['checkDependencies'],
	
	Extends: Input,

	initialize: function(fields, form, options){
		
		this.parent( fields, form, options);
		this.setOptions( options );
		
	},
	attach: function( field ){
		
		var instance = this.parent( field );
		var inputDependencies = field.get('data-dependencies');
		
		if( inputDependencies ){
			this.addDependency( instance, inputDependencies );
		}
		
		return instance;
		
	},
	addDependency: function(fieldInstance, dataDependencies){
		
		var dependencies = JSON.decode(dataDependencies.clean());
		
		if( !fieldInstance.dependencies ){
			fieldInstance.dependencies = [];
			(fieldInstance.fieldset || fieldInstance.field ).addEvent('change', this.checkDependencies.pass(fieldInstance ) );
		}
		
		(typeOf(dependencies) == 'array' ? dependencies : [dependencies]).each( function( dependency ){
			var funcName = dependency['function'];
			
			fieldInstance.dependencies.push({
				element: fieldInstance.field.getElements(dependency.element),
				fn: this.options[funcName] || fieldInstance[funcName] || false
			});
		}, this);
		//return dependingFields;
	}, 
	checkDependencies: function( fieldInstance ){
		
		fieldInstance.dependencies.each( function( dependency ){
			if( dependency.fn )
				dependency.fn( fieldInstance, dependency.element );
		});
		
	},
	removeDependency: function(){
		
	},
	updateDependency: function(){
		
	},
	restoreValues: function(values, focus){
		
		var currentValues = this.getValues(),
				newValues = Object.clone( values ),
				getField = function( form, key ){
					var name = '[name=' + key + ']',
							field = form.getElement('input'+ name +', select' + name + ', textarea' + name);
							
					return field ? field : false;
				},
				fieldInstance,
				newValue;
		
		
		Object.each( newValues, function(value, key){
			
			if( !currentValues[key] )
				return;
			
			
			if( value.value.toString() != currentValues[key].value.toString() ){
				
				var field = getField( this.form, key );
				
				if( field ){
					fieldInstance = field.retrieve('behavior');
					newValue = fieldInstance.restoreValue( value, key == focus || false );
					
					if( fieldInstance.dependencies )
						this.checkDependencies( fieldInstance );

					this.setValues( field );
				}
			} else if(focus == key){
				fieldInstance = getField( this.form, key ).retrieve('behavior');
				fieldInstance.restoreValue( value, true );
			}
			
		}, this);
		
	}
});