"use strict"

describe('numberinput', function () {
	var $scope,
		element;

	beforeEach(module('ui.cg.numberinput'));

    afterEach(function () {
        $scope.$destroy();
        element = undefined;
    });

    function createInput(html) {
        inject( function ($rootScope, $compile) {
            $scope = $rootScope.$new();
            $scope.input = 0;
            element = $compile(angular.element(html))($scope);
            $rootScope.$digest();
        });
    }

	function setValue(value) {
		element.val(value);
		element.trigger('input');
		$scope.$digest();
	}

    describe('default settings', function () {

        beforeEach(function () {
            var html = '<numberinput ng-model="input" />';
            createInput(html);
        });
	
        it('it should only accept numbers as input', function () {
            setValue('1a2b3c4d5e');

            expect(element.val()).toEqual('12345');
        });

        it('it should accept a dot (.) as a decimal separator', function () {
            setValue('1.25');

            expect(element.val()).toEqual('1.25');
        });

        it('it should not accept anything but a dot (.) as a decimal separator', function () {
            setValue('1,25');

            expect(element.val()).toEqual('125');
        });

        it('it should only accept one decimal separator', function () {
            setValue('10.1.0');

            expect(element.val()).toEqual('10.10');
        });

        it('it should only allow 2 decimals', function () {
            setValue('1.236');

            expect(element.val()).toEqual('1.23');
        });

        it('it should be able to handle an empty value', function () {
            setValue('');

            expect(element.val()).toEqual('');
        });

        it('it should round to two decimals on blur', function () {
            setValue('1.2');
            element.trigger('blur');

            expect(element.val()).toEqual('1.20');
        });

        it('it should not allow a decimal separator to be entered as the first character', function () {
            setValue('.');

            expect(element.val()).toEqual('');
        });

        it('model value should be a float', function () {
            setValue('1.23');

            expect($scope.input).toEqual(1.23);
            expect(typeof $scope.input).toEqual('number');
        });

        it('view value should be a string', function () {
            setValue('4.56');

            expect(element.val()).toEqual('4.56');
            expect(typeof element.val()).toEqual('string');
        });

    });

    describe('decimal separator', function () {

        it('it should accept a custom decimal separator', function () {
            var html = '<numberinput ng-model="input" decimal-separator="x" />';
            createInput(html);

            setValue('1.25');

            expect(element.val()).toEqual('1x25');
        });

        it('it should only use the first character of the decimal separator', function () {
            var html = '<numberinput ng-model="inpu" decimal-separator="abc" />';
            createInput(html);

            setValue('4.56');

            expect(element.val()).toEqual('4a56');
        })

    });

    describe('decimals setting', function () {

        it('it should not accept a decimal separator if the number of decimals is zero', function () {
           var html = '<numberinput ng-model="input" decimals="0" />';
            createInput(html);

            setValue('14.25');
            expect(element.val()).toEqual('14');
        });

        it('it should treat a negative number for the decimals attribute as zero', function () {
            var html = '<numberinput ng-model="input" decimals="-5" />';
            createInput(html);

            setValue('14.25');
            expect(element.val()).toEqual('14');
        })

        it('it should only allow 3 decimals', function () {
            var html = '<numberinput ng-model="input" decimals="3" />';
            createInput(html);

            setValue('1.2345');

            expect(element.val()).toEqual('1.234');
        });

        it('model value should have 3 decimals', function () {
            var html = '<numberinput ng-model="input" decimals="3" />';
            createInput(html);

            setValue('1.2345');

            expect($scope.input).toEqual(1.234);
        });

        it('it should ignore an invalid value for the decimals', function () {

            var html = '<numberinput ng-model="input" decimals="foobar" />';
            createInput(html);

            setValue('1.2345');

            expect($scope.input).toEqual(1.23);
            expect(element.val()).toEqual('1.23');
        });

    });

});