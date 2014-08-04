/*
 * cg-ui
 * https://github.com/geersch/ui.cg
 * Version: 0.1.0-BETA - 2014-08-04
 * License: MIT
 */
angular.module("ui.cg", ["ui.cg.tpls", "ui.cg.numberinput","ui.cg.timepicker"]);
angular.module("ui.cg.tpls", ["template/numberinput/numberinput.html","template/timepicker/timepicker.html"])
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
 *
 * @example
 <example module="app">
 <file name="index.html">
    <div ng-controller="NumberInputCtrl">
        <numberinput ng-model="value" decimals="2" decimal-separator="," step="0.01" />
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

    this.init = function (element) {
        var input = element.find('input').eq(0);

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
        var modelValue = $scope.number;
        if (isNaN(modelValue)) {
            modelValue = 0;
        }

        var multiplier = decimals === 0 ? 1 : parseInt('1' + Array(decimals + 1).join("0"), 10);
        var modelValue = Math.round((modelValue + step) * multiplier) / multiplier;

        $scope.number = modelValue;
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

    $scope.spinner = numberinputConfig.spinner;
    if ($attrs.spinner) {
        $attrs.$observe('spinner', function (value) {
            $scope.spinner = angular.isDefined(value) ? $scope.$eval(value) : true;
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

            ngModelCtrl.$formatters.unshift(function (input) {
                if (angular.isUndefined(input)) {
                    return '';
                }

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();
                return String(input).replace('.', decimalSeparator);
            });

            function render() {
                var modelValue = ngModelCtrl.$modelValue;
                if (angular.isUndefined(modelValue) || isNaN(modelValue)) {
                    return;
                }

                var decimalSeparator = numberinputCtrl.getDecimalSeparator();
                var decimals = numberinputCtrl.getDecimals();

                var viewValue = modelValue.toFixed(decimals).replace('.', decimalSeparator);
                if (viewValue !== ngModelCtrl.$viewValue) {
                    ngModelCtrl.$setViewValue(viewValue);
                    ngModelCtrl.$render();
                }
            }

            element.bind('blur', function () {
                render();
            });

            scope.$watch('decimals + decimalSeparator', function (newVal, oldVal) {
                render();
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
/**
 * @ngdoc directive
 * @name cg.ui.directive:timepicker
 * @element timepicker
 * @restrict E
 * @function
 *
 * @description
 * A simple timepicker.
 *
 * @example
 <example module="app">
 <file name="index.html">
    <div ng-controller="TimepickerCtrl">
        <timepicker ng-model="time" />
        <pre><strong>Model value</strong>: {{time}} </pre>
    </div>
 </file>
 <file name="app.js">
    var app = angular.module('app', ['ui.cg']);
    app.controller('TimepickerCtrl', ['$scope', function ($scope) {
        $scope.time = new Date();
    }]);
 </file>
 </example>
 */
angular.module('ui.cg.timepicker', [])

.controller('TimepickerController', ['$scope', function ($scope) {

}])

.directive('timepicker', function () {

    return {
        restrict: 'E',
        controller: 'TimepickerController',
        require: ['timepicker', 'ngModel'],
        template: '<div><input /><input/><button /></div>',
        replace: true,
        link: function (scope, element, attrs, ctrl) {
            var timepickerCtrl = ctrl[0],
                ngModelCtrl = ctrl[1];

        }
    };

});
angular.module("template/numberinput/numberinput.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/numberinput/numberinput.html",
    "<div class=\"input-append\">\n" +
    "    <input type=\"text\" class=\"input-mini\" type=\"text\" ng-model=\"number\" float>\n" +
    "    <span class=\"btn-group\" ng-show=\"spinner\">\n" +
    "        <button class=\"btn\" ng-click=\"increment()\">\n" +
    "            <i class=\"icon icon-chevron-up\"></i>\n" +
    "        </button>\n" +
    "       <button class=\"btn\" ng-click=\"decrement()\">\n" +
    "           <i class=\"icon icon-chevron-down\"></i>\n" +
    "       </button>\n" +
    "    </span>\n" +
    "</div>");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "");
}]);
