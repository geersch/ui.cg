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