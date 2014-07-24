"use strict"

describe('greeting service', function() {

	beforeEach(module('cgeers.services'));

	it('it should say hello', inject( function (greetingService) {				
		var greeting = greetingService.sayHello('Christophe');				
		
		expect(greeting).toEqual('Hello, Christophe!');	
	}));

});