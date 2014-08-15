angular.module('ui.cg.input', [])

.directive('input', function () {
    return {
        restrict: 'E',
        require: ['ngModel'],
        link: function (scope, element, attrs, ctrls) {
            var ngModelCtrl = ctrls[0];
            if (angular.isUndefined(ngModelCtrl)) {
                return;
            }

            ngModelCtrl.$focused = false;

            element.bind('focus', function (event) {
                scope.$apply(function () {
                    ngModelCtrl.$focused = true;
                });
            });

            element.bind('blur', function (event) {
                scope.$apply(function () {
                    ngModelCtrl.$focused = false;
                });
            });
        }
    };
});