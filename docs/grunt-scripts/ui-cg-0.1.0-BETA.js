/*
 * cg-ui
 * https://github.com/geersch/ui.cg
 * Version: 0.1.0-BETA - 2014-07-25
 * License: MIT
 */
angular.module("ui.cg", ["ui.cg.numberinput"]);
/**
 * @ngdoc directive
 * @name rfx.directive:rAutogrow
 * @element textarea
 * @function
 *
 * @description
 * Resize textarea automatically to the size of its text content.
 *
 * @example
   <example module="rfx">
     <file name="index.html">
         <textarea ng-model="text" r-autogrow class="input-block-level"></textarea>
         <pre>{{text}}</pre>
     </file>
   </example>
 */
angular.module('rfx', []).directive('rAutogrow', function() {
  // add helper vor measurement to body
    var testObj = angular.element('<textarea id="autogrow-helper" style="height: 0; position: absolute; top: -999px"/>');
    angular.element(window.document.body).append(testObj);

    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var adjustHeight = function() {
                var height, width = element[0].clientWidth;
                testObj.css('width', width + 'px').val(element.val());
                height = testObj[0].scrollHeight;
                element.css('height', height + 18 + 'px');
            };

            // adjust on model change.
            scope.$watch(attrs.ngModel, adjustHeight);

            // model value is trimmed so adjust on enter, space, delete too
            element.bind('keyup', function(event) {
                var key = event.keyCode;
                if (key === 13 || key === 32 || key === 8 || key === 46) {
                    adjustHeight();
                }
            });
            // insert only returns & spaces and delete per context menu is not covered;
        }
    };
});
angular.module('ui.cg.numberinput', [])

.directive('numberinput', function () {

	return {
		 restrict: 'E',		
		 require: 'ngModel',				
		 template: '<input type="text" />',						 
		 replace: true,		
		 link: function (scope, element, attrs, ctrl) {
			var decimals = 2;			
		 
			function sanitizeFloat(input) {									
				function clean(input) {
					return input.replace(/[^0-9]/g, '');
				}
				
				var sanitized = String(input).replace('.', ',');
				
				var position = sanitized.indexOf(',');
				
				if (position === 0) {
					sanitized = '0,';				
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