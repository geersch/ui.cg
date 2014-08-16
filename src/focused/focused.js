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