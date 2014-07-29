'use strict'

describe('timepicker', function () {
    var $scope;

    beforeEach(module('ui.cg.timepicker'));

    function createElement(html, time) {
        var element;

        inject(function ($rootScope, $compile) {
            $scope = $rootScope.$new();
            $scope.time = time;
            element = $compile(angular.element(html))($scope);
            $rootScope.$digest();
        });

        return element;
    }

    function getTimeState() {
        return ['07', '23', 'AM'];
    }

    function getModelState() {
        return [7, 23];
    }

    describe('basic functionality', function () {
        var element;

        beforeEach(function () {
            var time = new Date(2014, 7, 29, 7, 23, 0);
            element = createElement('<timepicker ng-model="time" />');
        });

        it('should contain 3 input elements', function () {
            expect(element.find('input').length).toBe(2);
            expect(element.find('button').length).toBe(1);
        });

        it('should initially have the correct time and meridian', function () {
            expect(getTimeState()).toEqual(['07', '23', 'AM']);
            expect(getModelState()).toEqual([7, 23]);
        });
    });

});