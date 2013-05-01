/*
---

name: Input.Handlers
description: Retrieves options from HTML property data-az-options and pass it as instance option object
authors: AtelierZuppinger:@fingerflow
provides: Input.Handlers
requires:
  - Input/Input.Dependencies
...
*/


Input.Handlers = new Class({

	options: {/*
		
	*/
	},
	Binds: [],
	
	Extends: Input.Dependencies,
	
	initiateField: function(object, field){
		
		var options = field.get('data-az-options');
		if( options ){
			this.parent(object, field, JSON.decode(options));
		} else 
			this.parent(object, field);
		
	}
	
});