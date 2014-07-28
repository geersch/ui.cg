'use strict'

describe('numberinput', function () {
    var $scope,
        changeInputValueTo;

    beforeEach(module('ui.cg.numberinput'));

    beforeEach(inject (function ($sniffer) {

        changeInputValueTo = function (element, value) {
            element.val(value);
            element.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
            $scope.$digest();
        };

    }));

    function createInput(html) {
        var element;

        inject(function ($rootScope, $compile) {
            $scope = $rootScope.$new();
            $scope.input = 0;
            element = $compile(angular.element(html))($scope);
            $rootScope.$digest();
        });

        return element;
    }

    var triggerKeyDown = function (element, keyCode) {
        var e = $.Event('keydown');
        e.which = keyCode;
        element.trigger(e);
    };

    describe('basic functionality', function () {
        var element;

        beforeEach(function () {
            element = createInput('<numberinput ng-model="input" />');
        });

        it('it should only accept numbers as input', function () {
            changeInputValueTo(element, '1a2b3c4d5e');
            expect(element.val()).toEqual('12345');
        });

        it('it should accept a dot (.) as a decimal separator', function () {
            changeInputValueTo(element, '1.25');
            expect(element.val()).toEqual('1.25');
        });

        it('it should not accept anything but a dot (.) as a decimal separator', function () {
            changeInputValueTo(element, '1,25');
            expect(element.val()).toEqual('125');
        });

        it('it should only accept one decimal separator', function () {
            changeInputValueTo(element, '10.1.0');
            expect(element.val()).toEqual('10.10');
        });

        it('it should only allow 2 decimals', function () {
            changeInputValueTo(element, '1.236');
            expect(element.val()).toEqual('1.23');
        });

        it('it should be able to handle an empty value', function () {
            changeInputValueTo(element, '');
            expect(element.val()).toEqual('');
        });

        it('it should round to two decimals on blur', function () {
            changeInputValueTo(element, '1.2');
            element.trigger('blur');
            expect(element.val()).toEqual('1.20');
        });

        it('it should not allow a decimal separator to be entered as the first character', function () {
            changeInputValueTo(element, '.');
            expect(element.val()).toEqual('');
        });

        it('model value should be a float', function () {
            changeInputValueTo(element, '1.23');
            expect($scope.input).toEqual(1.23);
            expect(typeof $scope.input).toEqual('number');
        });

        it('view value should be a string', function () {
            changeInputValueTo(element, '4.56');
            expect(element.val()).toEqual('4.56');
            expect(typeof element.val()).toEqual('string');
        });
    });

    describe('decimal separator', function () {

        it('it should accept a custom decimal separator', function () {
            var element = createInput( '<numberinput ng-model="input" decimal-separator="x" />');
            changeInputValueTo(element, '1.25');
            expect(element.val()).toEqual('1x25');
        });

        it('it should only use the first character of the decimal separator', function () {
            var element = createInput('<numberinput ng-model="inpu" decimal-separator="abc" />');
            changeInputValueTo(element, '4.56');
            expect(element.val()).toEqual('4a56');
        })
    });

    describe('decimals setting', function () {

        it('should not accept a decimal separator if the number of decimals is zero', function () {
            var element = createInput('<numberinput ng-model="input" decimals="0" />');
            changeInputValueTo(element, '14.25');
            expect(element.val()).toEqual('14');
        });

        it('should treat a negative number for the decimals attribute as zero', function () {
            var element = createInput('<numberinput ng-model="input" decimals="-5" />');
            changeInputValueTo(element, '14.25');
            expect(element.val()).toEqual('14');
        })

        it('should only allow 3 decimals', function () {
            var element = createInput('<numberinput ng-model="input" decimals="3" />');
            changeInputValueTo(element, '1.2345');
            expect(element.val()).toEqual('1.234');
        });

        it('should have 3 decimals for the model value', function () {
            var element = createInput('<numberinput ng-model="input" decimals="3" />');
            changeInputValueTo(element, '1.2345');
            expect($scope.input).toEqual(1.234);
        });

        it('should ignore an invalid value for the decimals', function () {
            var element = createInput('<numberinput ng-model="input" decimals="foobar" />');
            changeInputValueTo(element, '1.2345');
            expect($scope.input).toEqual(1.23);
            expect(element.val()).toEqual('1.23');
        });
    });

    describe('keyboard navigation', function () {
        var element;

        beforeEach(function () {
            var html ='<numberinput ng-model="input" decimals="0" />';
            element = createInput(html);
        });

        it('should increase the value when the up arrow is pressed', function () {
            changeInputValueTo(element, '1');
            triggerKeyDown(element, 38);
            expect(element.val()).toEqual('2');
            expect($scope.input).toEqual(2);
        });

        it('should decrease the value when the down arrow is pressed', function () {
            changeInputValueTo(element, '2');
            triggerKeyDown(element, 40);
            expect(element.val()).toEqual('1');
            expect($scope.input).toEqual(1);
        });

        it('should start at zero when the up arrow is pressed for an empty value', function () {
            changeInputValueTo(element, '');
            triggerKeyDown(element, 38);
            expect(element.val()).toEqual('1');
            expect($scope.input).toEqual(1);
        });

        it('should start at zero when the down arrow is pressed for an empty value', function () {
            changeInputValueTo(element, '');
            triggerKeyDown(element, 40);
            expect(element.val()).toEqual('-1');
            expect($scope.input).toEqual(-1);
        })
    });

});
