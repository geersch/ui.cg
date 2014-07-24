(function(angular) {

	var module = angular.module('cgeers.services', []);
	
	var serviceFn = function  () {	
	
		function sayHello(name) {		
			return 'Hello, ' + name + '!';
		}
	
		var service = {	
			sayHello: function (name) { 
				return sayHello(name);
			}
		};
	
		return service;
	}	
	
	module.service('greetingService', [serviceFn]);

})(window.angular);

