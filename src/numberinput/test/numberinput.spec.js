"use strict"

describe('numberinput', function () {
	var $scope,
		element;

	beforeEach(module('ui.cg.numberinput'));
	
	beforeEach(function () {	
		var html = '<numberinput ng-model="input" />';
		
		inject( function ($rootScope, $compile) {
			$scope = $rootScope.$new();							
			$scope.input = 0;
			element = $compile(angular.element(html))($scope);											
			$rootScope.$digest();
		});						
	});

	function setValue(value) {
		element.val(value);
		element.trigger('input');
		$scope.$digest();
	}	
	
	it('it should only accept numbers as input', function () {	
		setValue('1a2b3c4d5e');
		
		expect(element.val()).toEqual('12345');		
	});
	
	it('it should accept a dot (.) as a decimal separator', function () {
		setValue('1.25');
		
		expect(element.val()).toEqual('1,25');	
	});
	
	it('it should accept a comma (,) as a decimal separator', function () {	
		setValue('1,25');
		
		expect(element.val()).toEqual('1,25');
	});
	
	it('it should only accept one decimal separator', function () {
		setValue('10.1.0');
		
		expect(element.val()).toEqual('10,10');	
	});
	
	it('it should only allow 2 decimals by default', function () {
		setValue('1.236');
		
		expect(element.val()).toEqual('1,23');	
	});

	it('it should be able to handle an empty value', function () {
		setValue('');
		
		expect(element.val()).toEqual('');
	});		

	it('it should round to two decimals on blur', function () {
		setValue('1.2');
		element.trigger('blur');
		
		expect(element.val()).toEqual('1,20');
	});
	
	it('it should be able to handle a decimal separator as the first entered character', function () {
		setValue('.');
		
		expect(element.val()).toEqual('0,');				
	});
	
	it('model value should be a float', function () {
		setValue('1,23');
		
		expect($scope.input).toEqual(1.23);
		expect(typeof $scope.input).toEqual('number');
	});
	
	it('view value should be a string', function () {
		setValue('4,56');
		
		expect(element.val()).toEqual('4,56');
		expect(typeof element.val()).toEqual('string');
	});

});