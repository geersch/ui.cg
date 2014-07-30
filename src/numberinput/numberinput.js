angular.module('ui.cg.numberinput', [])

.directive('numberinput', function () {

    var HOT_KEYS = [38, 40];

    return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl: 'template/numberinput/numberinput.html',
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

            var step = scope.$eval(attrs.step) || 1;
            var minimumStep = decimals === 0 ? 1 : parseFloat('0.' + Array(decimals).join("0") + "1", 10);
            if (step < minimumStep) {
                step = minimumStep;
            }

            function sanitizeFloat(input) {
                function clean(input) {
                    return input.replace(/[^-0-9]/g, '');
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

            function addToModelValue(step) {
                return function () {
                    var modelValue = ctrl.$modelValue;
                    if (isNaN(modelValue)) {
                        modelValue = 0;
                    }

                    var multiplier = decimals === 0 ? 1 : parseInt('1' + Array(decimals + 1).join("0"), 10);
                    var modelValue = Math.round((modelValue + step) * multiplier) / multiplier;

                    ctrl.$setViewValue(modelValue);
                    ctrl.$render();
                }
            }

            var incrementByStep = addToModelValue(step);
            var decrementByStep = addToModelValue(step * -1);

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

            //bind keyboard events: arrows up(38) / down(40)
            element.bind('keydown', function (evt) {
                if (HOT_KEYS.indexOf(evt.which) === -1) {
                    return;
                }

                evt.stopPropagation();

                if (evt.which === 40) {
                    decrementByStep();
                } else if (evt.which === 38) {
                    incrementByStep();
                }

                scope.$apply();
            });

            element.bind('mousewheel wheel', function(evt) {

                var isScrollingUp = function (e) {
                    if (e.originalEvent) {
                        e = e.originalEvent;
                    }

                    var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
                    return (e.detail || delta > 0);
                };

                evt.preventDefault();

                if (isScrollingUp(evt)) {
                    incrementByStep();
                }
                else {
                    decrementByStep();
                }

                scope.$apply();
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