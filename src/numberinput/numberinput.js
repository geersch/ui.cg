/**
 * @ngdoc directive
 * @name cg.ui.directive:numberinput
 * @element numberinput
 * @restrict E
 * @function
 *
 * @description
 * Input for floating point numbers which accept a comma (,) as a decimal separator.
 *
 * @example
   <example module="app">
     <file name="index.html">
		 <div ng-controller="NumberInputCtrl">
		     <numberinput ng-model="value" decimals="2" />
		     <pre><strong>Model value</strong>: {{value}} </pre>
		 </div>
     </file>
	 <file name="app.js">
		var app = angular.module('app', ['ui.cg']);
		
		app.controller('NumberInputCtrl', ['$scope', function ($scope) {
		    $scope.value = 34.75;
		}]);		
	 </file>
   </example>
 */
angular.module('ui.cg.numberinput', [])

.directive('numberinput', function () {

	return {
		 restrict: 'E',		
		 require: 'ngModel',				
		 template: '<input type="text" />',						 
		 replace: true,		
		 link: function (scope, element, attrs, ctrl) {
			var decimals = 2;
            if (angular.isDefined(attrs.decimals)) {
                var value = parseInt(attrs.decimals, 10);
                if (!isNaN(value)) {
                    decimals = value;
                }
            }

			function sanitizeFloat(input) {									
				function clean(input) {
					return input.replace(/[^0-9]/g, '');
				}
				
				var sanitized = String(input).replace('.', ',');
				
				var position = sanitized.indexOf(',');
				
				if (position === 0) {
					sanitized = '';
				} else if (position !== -1) {
					var part1 = sanitized.substr(0, position);
					var part2 = sanitized.substr(position + 1);
					
					var integerPart = clean(part1);
					var fractionalPart = clean(part2).substr(0, decimals);										
					
					sanitized = integerPart + ',' + fractionalPart;															
				} else {
					sanitized = clean(sanitized);
				}						
				
				return sanitized;														
			}
			
			function convertToFloat(input) {	
				if (angular.isUndefined(input) || input.length === 0) {
					return undefined;
				}	
				
				return parseFloat(input.replace(',', '.'));				
			}		
			
			function sanitize(input) {					
				if (angular.isUndefined(input) || input.length === 0) {
					return undefined;
				}
				
				var viewValue = sanitizeFloat(input);
				var modelValue = convertToFloat(viewValue);								
				
				if (viewValue !== input) {															
					ctrl.$setViewValue(viewValue);
					ctrl.$render();
				}
				
				return modelValue;				
			}									
			
			ctrl.$parsers.unshift(sanitize);
			
			ctrl.$formatters.unshift(function (input) {
				if (angular.isUndefined(input)) {
					return undefined;
				}								
				
				return String(input).replace('.', ',');
			});		
			
			element.bind('blur', function () {
				var value = element.val();
				if (angular.isUndefined(value) || value.length === 0) {
					return;
				}
				
				value = parseFloat(value.replace(',', '.'));
				var rounded = value.toFixed(decimals).replace('.', ',');				
				if (rounded !== value) {
					element.val(rounded);
				}								
			});
		}				
	};
});