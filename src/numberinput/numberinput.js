angular.module('ui.cg.numberinput', [])

.constant('numberinputConfig', {
    decimalSeparator: '.',
    decimals: 2,
    step: 1
})

.controller('NumberInputController', ['$scope', '$attrs', 'numberinputConfig', function ($scope, $attrs, numberinputConfig) {
    var HOT_KEYS = [38, 40];

    this.init = function (element) {
        var input = element.find('input').eq(0);
        this.bindKeyboardEvents(input);
        this.bindMouseWheelEvents(input);
    };

    function stepIt(step) {
        var modelValue = $scope.number;
        if (isNaN(modelValue)) {
            modelValue = 0;
        }

        var multiplier = decimals === 0 ? 1 : parseInt('1' + Array(decimals + 1).join("0"), 10);
        var modelValue = Math.round((modelValue + step) * multiplier) / multiplier;

        $scope.number = modelValue
    }

    $scope.increment = function () {
        var step = getStep();
        stepIt(step);
    }

    $scope.decrement = function () {
        var step = getStep();
        stepIt(step * -1);
    }

    this.bindMouseWheelEvents = function(input) {
        var isScrollingUp = function (e) {
            if (e.originalEvent) {
                e = e.originalEvent;
            }

            var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;

            return (e.detail || delta > 0);
        };

        input.bind('mousewheel wheel', function (e) {
            $scope.$apply(isScrollingUp(e) ? $scope.increment() : $scope.decrement());
            e.preventDefault();
        });
    }

    this.bindKeyboardEvents = function(input) {
        input.bind('keydown', function (e) {
            if (HOT_KEYS.indexOf(e.which) === -1) {
                return;
            }

            e.stopPropagation();

            if (e.which === 40) {
                $scope.decrement();
            } else if (e.which === 38) {
                $scope.increment();
            }

            $scope.$apply();
        });
    };

    this.getDecimalSeparator = function () {
        return decimalSeparator;
    }

    var decimalSeparator = numberinputConfig.decimalSeparator;
    if ($attrs.decimalSeparator) {
        $attrs.$observe('decimalSeparator', function (value) {
            var parsed;
            if (!angular.isDefined(value) || value.length === 0) {
                parsed = numberinputConfig.decimalSeparator;
            } else {
                parsed = value[0];
            }

            decimalSeparator = parsed;
        })
    }

    this.getDecimals = function () {
        return decimals;
    }

    var decimals = numberinputConfig.decimals;
    if ($attrs.decimals) {
        $attrs.$observe('decimals', function (value) {
            var parsed;
            if (angular.isUndefined(value) || isNaN(value)) {
                parsed = numberinputConfig.decimals;
            } else {
                parsed = parseInt(value, 10);
            }

            if (parsed < 0) {
                parsed = 0;
            }

            decimals = parsed;
        });
    }

    function getStep() {
        var corrected = step;
        var minimumStep = decimals === 0 ? 1 : parseFloat('0.' + Array(decimals).join("0") + "1", 10);
        if (corrected < minimumStep) {
            corrected = minimumStep;
        }

        return corrected;
    }

    var step = numberinputConfig.step;
    if ($attrs.step) {
        $attrs.$observe('step', function (value) {
            var parsed;
            if (angular.isUndefined(value) || isNaN(value)) {
                parsed = numberinputConfig.step;
            } else {
                parsed = parseFloat(value, 10);
            }

            step = parsed;
        });
    }
}])

.directive('float', function () {
    return {
        restrict: 'A',
        require: ['^numberinput', '^ngModel'],
        link: function (scope, element, attrs, ctrls) {
            var numberinputCtrl = ctrls[0],
                ngModelCtrl = ctrls[1];

            function sanitizeFloat(input) {
                function clean(input) {
                    return input.replace(/[^-0-9]/g, '');
                }

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();
                var decimals = numberinputCtrl.getDecimals();

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

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();

                return parseFloat(input.replace(decimalSeparator, '.'), 10);
            }

            function sanitize(input) {
                if (angular.isUndefined(input) || input.length === 0) {
                    return undefined;
                }

                var viewValue = sanitizeFloat(input);
                var modelValue = convertToFloat(viewValue);

                if (viewValue !== input) {
                    ngModelCtrl.$setViewValue(viewValue);
                    ngModelCtrl.$render();
                }

                return modelValue;
            }

            ngModelCtrl.$parsers.unshift(sanitize);
            ngModelCtrl.$formatters.unshift(sanitize);

            ngModelCtrl.$formatters.unshift(function (input) {
                if (angular.isUndefined(input)) {
                    return '';
                }

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();
                return String(input).replace('.', decimalSeparator);
            });

            element.bind('blur', function () {
                var value = element.val();
                if (angular.isUndefined(value) || value.length === 0) {
                    return;
                }

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();
                var decimals = numberinputCtrl.getDecimals();

                value = parseFloat(value.replace(decimalSeparator, '.'));
                var rounded = value.toFixed(decimals).replace('.', decimalSeparator);
                if (rounded !== value) {
                    element.val(rounded);
                }
            });
        }
    }
})

.directive('numberinput', function () {
    return {
        restrict: 'E',
        require: ['numberinput'],
        controller: 'NumberInputController',
        templateUrl: 'template/numberinput/numberinput.html',
        replace: true,
        scope: {
            number: '=ngModel',
            decimalSeparator: '@',
            decimals: '@',
            step: '@'
        },
        link: function (scope, element, attrs, ctrls) {
            var numberinputCtrl = ctrls[0];
            numberinputCtrl.init(element);
        }
    };
});