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