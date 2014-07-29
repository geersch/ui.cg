/*
 * cg-ui
 * https://github.com/geersch/ui.cg
 * Version: 0.1.0-BETA - 2014-07-29
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
 *
 * @example
 <example module="app">
 <file name="index.html">
    <div ng-controller="NumberInputCtrl">
        <numberinput ng-model="value" decimals="2" decimal-separator="," />
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

                var modelValue = ctrl.$modelValue;
                if (isNaN(modelValue)) {
                    modelValue = 0;
                }

                if (evt.which === 40) {
                    modelValue = modelValue - 1;
                } else if (evt.which === 38) {
                    modelValue = modelValue + 1;
                }

                ctrl.$setViewValue(modelValue);
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
    "<input type=\"text\" />");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/timepicker/timepicker.html",
    "");
}]);
