'use strict'

describe('input', function () {

    describe('focus', function () {
        var $scope, element;

        beforeEach(module('ui.cg.input'));

        beforeEach(function () {
            var html = '<form name="form"><input name="input" type="text" ng-model="input" /></form>';

            inject(function ($rootScope, $compile) {
                $scope = $rootScope.$new();
                $scope.input = 0;
                element = $compile(angular.element(html))($scope);
                $rootScope.$digest();
            });

            element.appendTo(document.body);
        });

        afterEach(function () {
            element.remove();
        });

        function focus() {
            var input = element.find('input').eq(0);
            input.triggerHandler('focus');
        }

        function blur() {
            var input = element.find('input').eq(0);
            input.triggerHandler('blur');
        }

        it('should know when it has focus', function () {
            focus();
            expect($scope.form.input.$focused).toBeTruthy();
        });

        it('should know when it lost focus', function () {
            blur();
            expect($scope.form.input.$focused).toBeFalsy();
        });
    });

});