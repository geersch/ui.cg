'use strict'

describe('focused', function () {

    var $scope, element;

    beforeEach(module('ui.cg.focused'));

    beforeEach(function () {
        var html = '<form name="form">' +
            '<input name="input" type="text" ng-model="input" focused />' +
            '<input name="checkbox" type="checkbox" ng-model="checked" focused />' +
            '<select name="select" ng-model="selected" focused></select>' +
            '<textarea name="text" focused ng-model="text"></textarea>'
            '</form>';

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

    function focus(type) {
        var input = element.find(type).eq(0);
        input.triggerHandler('focus');
    }

    function blur(type) {
        var input = element.find(type).eq(0);
        input.triggerHandler('blur');
    }

    describe('default value', function () {

        it('should be false', function () {
            expect($scope.form.input.$focused).toBeDefined();
            expect($scope.form.input.$focused).toBeFalsy();
        });

    });

    describe('on input of type text', function () {

        it('should be true when the input has focus', function () {
            focus('input[type="text"]');
            expect($scope.form.input.$focused).toBeTruthy();
        });

        it('should be false when the input lost focus', function () {
            focus('input[type="text"]');
            blur('input[type="text"]');
            expect($scope.form.input.$focused).toBeFalsy();
        });

    });

    describe('on input of type checkbox', function () {

        it('should be true when the checkbox has focus', function () {
            focus('input[type="checkbox"]');
            expect($scope.form.checkbox.$focused).toBeTruthy();
        });

        it('should be false when the checkbox lost focus', function () {
            focus('input[type="checkbox"]');
            blur('input[type="checkbox"]');
            expect($scope.form.checkbox.$focused).toBeFalsy();
        });

    });

    describe('on select', function () {

        it('should be true when the select has focus', function () {
            focus('select');
            expect($scope.form.select.$focused).toBeTruthy();
        });

        it('should be false when the select lost focus', function () {
            focus('select');
            blur('select');
            expect($scope.form.select.$focused).toBeFalsy();
        });

    });

    describe('on textarea', function () {

        it('should be true when the textarea has focus', function () {
           focus('textarea');
            expect($scope.form.text.$focused).toBeTruthy();
        });


        it('should be false when the text lost focus', function () {
            focus('textarea');
            blur('textarea');
            expect($scope.form.text.$focused).toBeFalsy();
        });

    });
});