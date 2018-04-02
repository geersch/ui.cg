/*
 * cg-ui
 * https://github.com/geersch/ui.cg
 * Version: 0.1.0-BETA - 2018-04-02
 * License: MIT
 */
angular.module("ui.cg", ["ui.cg.tpls", "ui.cg.focused","ui.cg.numberinput"]);
angular.module("ui.cg.tpls", ["template/numberinput/numberinput.html"])
/**
 * @ngdoc directive
 * @name cg.ui.directive:focused
 * @element input type="text"
 * @restrict A
 * @function
 *
 * @description
 * Add this attribute on an input element so that it knows whether or not it has focus.
 *
 * formName.inputName.$focused: Returns true if the input has focus, false if not.
 *
 *
 * @example
 <example module="app">
 <file name="index.html">
    <div ng-controller="MainCtrl">
        <form name="form">
            <input name="input1" ng-model="value1" focused />
            <strong>Focused: </strong>{{form.input1.$focused}}
            <br />

            <input name="input2" ng-model="value2" focused />
            <strong>Focused: </strong>{{form.input2.$focused}}
            <br />

            <input name="input3" ng-model="value3" focused />
            <strong>Focused: </strong>{{form.input3.$focused}}
            <br />

            <numberinput name="numberinput" ng-model="number" />
            <strong>Focused: </strong>{{form.numberinput.$focused}}
        </form>
    </div>
 </file>
 <file name="app.js">
    var app = angular.module('app', ['ui.cg']);

    app.controller('MainCtrl', ['$scope', function($scope) {
        $scope.number = 35;
    }]);
 </file>
 </example>
 */
angular.module('ui.cg.focused', [])

.directive('focused', function () {
    return {
        restrict: 'A',
        require: ['ngModel'],
        link: function (scope, element, attrs, ctrls) {
            var ngModelCtrl = ctrls[0];
            if (!ngModelCtrl){
                return;
            }

            ngModelCtrl.$focused = false;

            element.bind('focus', function () {
                setFocused(true);
            });
            element.find('input').bind('focus', function () {
                setFocused(true);
            });

            element.bind('blur', function () {
                setFocused(false);
            });
            element.find('input').bind('blur', function () {
                setFocused(false);
            });

            function setFocused(focused) {
                scope.$apply(function () {
                    ngModelCtrl.$focused = focused;
                });
            }
        }
    };
});
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
 * @param {number=} step The value to increment or decrement with (default: 1).
 * @param {boolean=} mousewheel Whether user can scroll inside the input to increase or decrease the value (default: true).
 * @param {boolean=} keyboard Whether user can increase of decrease the value using the keyboard up/down arrows (default: true).
 * @param {boolean=} spinner Whether or not spin buttons are shown (default: true).
 * @param {number=} maximium The maximum allowed value (default none).
 * @param {number=} minimum The minimum allowed value (default: none).
 * @param {boolean=} ngDisabled Assignable angular expression to disable the numberinput controls (default :false).
 *
 * @example
 <example module="app">
 <file name="index.html">
    <div ng-controller="NumberInputCtrl">
        <numberinput ng-model="value" decimals="2" decimal-separator=","
            step="0.01" maximum="100" minimum="0" ng-disabled="disabled" />
        Disabled: <input type="checkbox" ng-model="disabled"><br />
        <pre><strong>Model value</strong>: {{value}} </pre>

        <h4>Keyboard legend</h4>
        <ul class="keyboard-legend">
            <li>
                <span class="key-button">up arrow</span>
                <span class="button-descr">increases the value</span>
            </li>
            <li>
                <span class="key-button">down arrow</span>
                <span class="button-descr">decreases the value</span>
            </li>
        </ul>
         <h4>Mouse legend</h4>
         <ul class="keyboard-legend">
            <li>
                <span class="key-button">wheel up</span>
                <span class="button-descr">increases the value</span>
            </li>
            <li>
                <span class="key-button">wheel down</span>
                <span class="button-descr">decreases the value</span>
            </li>
          </ul>
    </div>
 </file>
 <file name="app.js">
    var app = angular.module('app', ['ui.cg']);
    app.controller('NumberInputCtrl', ['$scope', function ($scope) {
        $scope.value = 34.75;
        $scope.disabled = false;
    }]);
 </file>
 </example>
 */
angular.module('ui.cg.numberinput', [])

.constant('numberinputConfig', {
    decimalSeparator: '.',
    decimals: 2,
    step: 1,
    keyboard: true,
    mousewheel: true,
    spinner: true
})

.controller('NumberInputController', ['$scope', '$attrs', 'numberinputConfig', function ($scope, $attrs, numberinputConfig) {
    var HOT_KEYS = [38, 40];
    var ngModelCtrl;

    this.init = function (element) {
        var input = element.find('input').eq(0);
        ngModelCtrl = input.controller('ngModel');

        if ($attrs.class) {
            var classes = $attrs.class.split(' ').filter(function (item, index, items) {
                return item !== 'input-append' && index === items.indexOf(item);
            });
            if (classes && classes.length > 0) {
                classes.forEach(function (c) {
                    input.addClass(c);
                    element.removeClass(c);
                })
            }
        }

        var keyboard = angular.isDefined($attrs.keyboard) ? $scope.$eval($attrs.keyboard) : numberinputConfig.keyboard;
        if (keyboard) {
            this.bindKeyboardEvents(input);
        }
        
        var mousewheel = angular.isDefined($attrs.mousewheel) ? $scope.$eval($attrs.mousewheel) : numberinputConfig.mousewheel;
        if (mousewheel) {
            this.bindMouseWheelEvents(input);
        }
    };

    function stepIt(step) {
        if ($scope.disabled === true) {
            return;
        }

        var modelValue = $scope.number;
        if (isNaN(modelValue)) {
            modelValue = 0;
        }

        var multiplier = decimals === 0 ? 1 : parseInt('1' + Array(decimals + 1).join("0"), 10);
        var modelValue = Math.round((modelValue + step) * multiplier) / multiplier;

        $scope.number = modelValue;

        checkValueBoundaries();
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

            ngModelCtrl.$render();
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

            ngModelCtrl.$render();
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

    $scope.spinner = numberinputConfig.spinner;
    if ($attrs.spinner) {
        $attrs.$observe('spinner', function (value) {
            $scope.spinner = angular.isDefined(value) ? $scope.$eval(value) : true;
        });
    }

    if ($attrs.maximum) {
        $attrs.$observe('maximum', function (value) {
            $scope.maximum = parseFloat(value, 10);
        });
    }

    if ($attrs.minimum) {
        $attrs.$observe('minimum', function (value) {
            $scope.minimum = parseFloat(value, 10);
        })
    }

    function checkValueBoundaries() {
        if (angular.isUndefined($scope.number) || isNaN($scope.number)) {
            return;
        }

        var multiplier = decimals === 0 ? 1 : parseInt('1' + Array(decimals + 1).join("0"), 10);
        if (angular.isDefined($scope.maximum) && !isNaN($scope.maximum)) {
            if (Math.round($scope.number * multiplier) > Math.round($scope.maximum * multiplier)) {
                updateValue($scope.maximum);
                return;
            }
        }

        if (angular.isDefined($scope.minimum) && !isNaN($scope.minimum)) {
            if (Math.round($scope.number * multiplier) < Math.round($scope.minimum * multiplier)) {
                updateValue($scope.minimum);
                return;
            }
        }
    }

    this.checkValueBoundaries = checkValueBoundaries;

    function updateValue(value) {
        if (isNaN(value)) {
            return;
        }

        $scope.number = value;
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

                function removeMinusSign(input) {
                    return input.replace(/-/g, '');
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

                position = sanitized.indexOf('-');
                if (position !== -1) {
                    var part1, part2;
                    if (position === 0) {
                        sanitized = sanitized.substr(0, 1) +
                            removeMinusSign(sanitized.substr(1));
                    } else {
                        sanitized = removeMinusSign(sanitized);
                    }
                }

                // Remove the trailing decimals separator if no decimals are allowed
                if (decimals === 0 && sanitized.indexOf(decimalSeparator) === sanitized.length - 1) {
                    sanitized = sanitized.substr(0, sanitized.length - 1);
                }

                return sanitized;
            }

            function convertToFloat(input) {
                if (angular.isUndefined(input) || input.length === 0) {
                    return 0;
                }

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();

                var result = parseFloat(input.replace(decimalSeparator, '.'), 10);
                if (isNaN(result)) { // e.g.: when typing the minus (-) sign
                    result = 0;
                }

                return result;
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

            ngModelCtrl.$render = function () {
                var decimalSeparator = numberinputCtrl.getDecimalSeparator();
                var viewValue = ngModelCtrl.$viewValue;
                if (!ngModelCtrl.$focused && angular.isDefined(ngModelCtrl.$modelValue)) {
                    var decimals = numberinputCtrl.getDecimals();
                    viewValue = ngModelCtrl.$modelValue.toFixed(decimals);
                    viewValue = viewValue.replace('.', decimalSeparator);
                }

                element.val(viewValue);
            }

            element.bind('blur', function () {
                scope.$apply(function () {
                    numberinputCtrl.checkValueBoundaries();
                });

                ngModelCtrl.$render();
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
            step: '@',
            disabled: '=ngDisabled'
        },
        link: function (scope, element, attrs, ctrls) {
            var numberinputCtrl = ctrls[0];
            numberinputCtrl.init(element);
        }
    };
});
angular.module("template/numberinput/numberinput.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/numberinput/numberinput.html",
    "<div class=\"input-append\" focused>\n" +
    "    <input type=\"text\" class=\"input-mini\" type=\"text\" ng-model=\"number\" float ng-disabled=\"disabled\" focused>\n" +
    "    <span class=\"btn-group\" ng-show=\"spinner\">\n" +
    "        <button class=\"btn\" type=\"button\" ng-click=\"increment()\" ng-disabled=\"disabled\">\n" +
    "            <i class=\"icon icon-chevron-up\"></i>\n" +
    "        </button>\n" +
    "       <button class=\"btn\" type=\"button\" ng-click=\"decrement()\" ng-disabled=\"disabled\">\n" +
    "           <i class=\"icon icon-chevron-down\"></i>\n" +
    "       </button>\n" +
    "    </span>\n" +
    "</div>");
}]);
