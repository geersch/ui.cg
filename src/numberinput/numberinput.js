/**
 * @ngdoc directive
 * @name cg.ui.directive:numberinput
 * @element numberinput
 * @restrict E
 * @function
 *
 * @description
 * Input for a floating point number with a configurable decimal separator (default: .) and decimals (default: 2).
 *
 * @param {string} ngModel Assignable angular expression to data-bind to.
 * @param {string=} decimal-separator The decimal separator to display (default: .).
 * @param {number=} decimals The maximum number of allowed decimals (default: 2).
 *
 * @example
 <example module="app">
 <file name="index.html">
    <div ng-controller="NumberInputCtrl">
        <numberinput ng-model="value" decimals="2" decimal-separator="," />
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
                var decimalSeparator = '.';
                var decimals = 2;

                // Determine the decimal separator
                if (angular.isDefined(attrs.decimalSeparator) && attrs.decimalSeparator.length > 0) {
                    decimalSeparator = attrs.decimalSeparator[0];
                }

                // Determine the number of decimals
                if (angular.isDefined(attrs.decimals)) {
                    var value = parseInt(attrs.decimals, 10);
                    if (!isNaN(value)) {
                        decimals = value;
                    }
                    if (decimals < 0) {
                        decimals = 0;
                    }
                }

                function sanitizeFloat(input) {
                    function clean(input) {
                        return input.replace(/[^0-9]/g, '');
                    }

                    var sanitized = String(input).replace('.', decimalSeparator);

                    var position = sanitized.indexOf(decimalSeparator);
                    if (position === 0) {
                        sanitized = '';
                    } else if (position !== -1) {
                        var part1 = sanitized.substr(0, position);
                        var part2 = sanitized.substr(position + 1);

                        var integerPart = clean(part1);
                        var fractionalPart = clean(part2).substr(0, decimals);

                        sanitized = integerPart + decimalSeparator + fractionalPart;
                    } else {
                        sanitized = clean(sanitized);
                    }

                    // Remove the trailing decimals separator if no decimals are allowed
                    if (decimals === 0 && sanitized.indexOf(decimalSeparator) === sanitized.length - 1) {
                        sanitized = sanitized.substr(0, sanitized.length - 1);
                    }

                    return sanitized;
                }

                function convertToFloat(input) {
                    if (angular.isUndefined(input) || input.length === 0) {
                        return undefined;
                    }

                    return parseFloat(input.replace(decimalSeparator, '.'));
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

                ctrl.$formatters.unshift(sanitize);

                ctrl.$formatters.unshift(function (input) {
                    if (angular.isUndefined(input)) {
                        return undefined;
                    }

                    return String(input).replace('.', decimalSeparator);
                });

                element.bind('blur', function () {
                    var value = element.val();
                    if (angular.isUndefined(value) || value.length === 0) {
                        return;
                    }

                    value = parseFloat(value.replace(decimalSeparator, '.'));
                    var rounded = value.toFixed(decimals).replace('.', decimalSeparator);
                    if (rounded !== value) {
                        element.val(rounded);
                    }
                });
            }
        };
    });