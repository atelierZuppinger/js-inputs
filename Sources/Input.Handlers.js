/*
---
name: Input.Handlers
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