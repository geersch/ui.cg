'use strict'

describe('timepicker', function () {
    var $scope, element;

    beforeEach(module('ui.cg.timepicker'));

    function createElement(html, hours, minutes) {
        var element;

        inject(function ($rootScope, $compile) {
            $scope = $rootScope.$new();
            $scope.time = newTime(hours, minutes);
            element = $compile(angular.element(html))($scope);
            $rootScope.$digest();
        });

        return element;
    }

    function newTime(hours, minutes) {
        var time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);
        time.setSeconds(0);

        return time;
    }

    function getTimeState(element) {
        var input = element.find('input');

        var state = [];
        var value = input.eq(0).val();
        if (value) {
            var parts = value.split(':');
            if (parts && parts.length === 2) {
                state = [parts[0], parts[1]];
            }
        }

        return state;
    }

    function getModelState() {
        return [ $scope.time.getHours(), $scope.time.getMinutes() ];
    }

    describe('basic functionality', function () {
        beforeEach(function () {
            element = createElement('<timepicker ng-model="time" />', 10, 30);
        });

//        it('should contain 2 input elements', function () {
//            expect(element.find('input').length).toBe(1);
//            expect(element.find('button').length).toBe(1);
//        });

//        it('should initially have the correct time and meridian', function () {
//
//
//            expect(getTimeState(element)).toEqual(['10', '30']);
//            expect(getModelState()).toEqual([10, 30]);
//        });
    });

});