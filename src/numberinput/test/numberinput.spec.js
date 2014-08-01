'use strict'

describe('numberinput', function () {
    var $scope,
        changeInputValueTo;

    beforeEach(module('ui.cg.numberinput'));
    beforeEach(module('template/numberinput/numberinput.html'));

    beforeEach(inject (function ($sniffer) {

        changeInputValueTo = function (element, value) {
            var input = element.find('input').eq(0);
            input.val(value);
            input.trigger($sniffer.hasEvent('input') ? 'input' : 'change');
            $scope.$digest();
        };

    }));

    function getElementValue(element) {
        var input = element.find('input').eq(0);
        return input.val();
    }

    function blur(element) {
        var input = element.find('input').eq(0);
        input.trigger('blur');
    }

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
        var input = element.find('input').eq(0);
        input.trigger(e);
    };

    function triggerMouseWheelEvent(element, delta) {
        var e = $.Event('mousewheel');
        e.wheelDelta = delta;
        var input = element.find('input').eq(0);
        input.trigger(e);
    }

    describe('UI', function () {

        it('should be rendered correctly upon creation', function () {
            var element = createInput('<numberinput ng-model="input" />');

            expect(getElementValue(element)).toEqual('0.00');
        });
    });

    describe('with default settings', function () {
        var element;

        beforeEach(function () {
            element = createInput('<numberinput ng-model="input" />');
        });

        it('should only accept numbers as input', function () {
            changeInputValueTo(element, '1a2b3c4d5e');
            expect(getElementValue(element)).toEqual('12345');
        });

        it('should accept a dot (.) as a decimal separator', function () {
            changeInputValueTo(element, '1.25');
            expect(getElementValue(element)).toEqual('1.25');
        });

        it('should not accept anything but a dot (.) as a decimal separator', function () {
            changeInputValueTo(element, '1,25');
            expect(getElementValue(element)).toEqual('125');
        });

        it('should only accept one decimal separator', function () {
            changeInputValueTo(element, '10.1.0');
            expect(getElementValue(element)).toEqual('10.10');
        });

        it('should only allow 2 decimals', function () {
            changeInputValueTo(element, '1.236');
            expect(getElementValue(element)).toEqual('1.23');
        });

        it('should be able to handle an empty value', function () {
            changeInputValueTo(element, '');
            expect(getElementValue(element)).toEqual('');
        });

        it('should round to two decimals on blur', function () {
            changeInputValueTo(element, '1.2');
            blur(element);
            expect(getElementValue(element)).toEqual('1.20');
        });

        it('should not allow a decimal separator to be entered as the first character', function () {
            changeInputValueTo(element, '.');
            expect(getElementValue(element)).toEqual('');
        });

        it('should store the model value as a float', function () {
            changeInputValueTo(element, '1.23');
            expect($scope.input).toEqual(1.23);
            expect(typeof $scope.input).toEqual('number');
        });

        it('should store the view value as a string', function () {
            changeInputValueTo(element, '4.56');
            expect(getElementValue(element)).toEqual('4.56');
            expect(typeof getElementValue(element)).toEqual('string');
        });

        it('should allow the minus sign (-) to be entered as the first character', function () {
            changeInputValueTo(element, '-');
            expect(getElementValue(element)).toEqual('-');
            expect($scope.input).toEqual(0);
        });

        it('should only accept one minus sign (-)', function () {
            changeInputValueTo(element, '-5-6');
            expect(getElementValue(element)).toEqual('-56');
            expect($scope.input).toEqual(-56);

            changeInputValueTo(element, '56---78---91');
            expect(getElementValue(element)).toEqual('567891');
            expect($scope.input).toEqual(567891);

            // bug fix test: it should only remove duplicate minus signs, not the decimal separator!
            element = createInput('<numberinput ng-model="input" step="0.01" />');
            changeInputValueTo(element, '0');
            triggerKeyDown(element, 40);
            expect(getElementValue(element)).toEqual('-0.01');
            expect($scope.input).toEqual(-0.01);
        });
    });

    describe('decimal separator setting', function () {

        it('should accept a custom decimal separator', function () {
            var element = createInput( '<numberinput ng-model="input" decimal-separator="x" />');
            changeInputValueTo(element, '1.25');
            expect(getElementValue(element)).toEqual('1x25');
        });

        it('should only use the first character of the decimal separator', function () {
            var element = createInput('<numberinput ng-model="input" decimal-separator="abc" />');
            changeInputValueTo(element, '4.56');
            expect(getElementValue(element)).toEqual('4a56');
        });

        it('should update the value if the setting changes', function () {
            var element = createInput('<numberinput ng-model="input" decimal-separator="{{decimalSeparator}}" />');
            $scope.decimalSeparator = ',';
            $scope.input = 2.35;
            $scope.$apply();

            expect(getElementValue(element)).toEqual('2,35');
            $scope.decimalSeparator = 'x';
            $scope.$apply();

            expect(getElementValue(element)).toEqual('2x35');
        });
    });

    describe('decimals setting', function () {

        it('should not accept a decimal separator if the number of decimals is zero', function () {
            var element = createInput('<numberinput ng-model="input" decimals="0" />');
            changeInputValueTo(element, '14.25');
            expect(getElementValue(element)).toEqual('14');
            expect($scope.input).toEqual(14);
        });

        it('should treat a negative number for the decimals attribute as zero', function () {
            var element = createInput('<numberinput ng-model="input" decimals="-5" />');
            changeInputValueTo(element, '14.25');
            expect(getElementValue(element)).toEqual('14');
            expect($scope.input).toEqual(14);
        })

        it('should only allow 3 decimals', function () {
            var element = createInput('<numberinput ng-model="input" decimals="3" />');
            changeInputValueTo(element, '1.2345');
            expect(getElementValue(element)).toEqual('1.234');
            expect($scope.input).toEqual(1.234);
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
            expect(getElementValue(element)).toEqual('1.23');
        });

        it('should update the value if the setting changes', function () {
            var element = createInput('<numberinput ng-model="input" decimals="{{decimals}}" />');
            $scope.decimals = 2;
            $scope.input = 2.35;
            $scope.$apply();

            expect(getElementValue(element)).toEqual('2.35');
            $scope.decimals = 3;
            $scope.$apply();

            expect(getElementValue(element)).toEqual('2.350');
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
            expect(getElementValue(element)).toEqual('2');
            expect($scope.input).toEqual(2);
        });

        it('should decrease the value when the down arrow is pressed', function () {
            changeInputValueTo(element, '2');
            triggerKeyDown(element, 40);
            expect(getElementValue(element)).toEqual('1');
            expect($scope.input).toEqual(1);
        });

        it('should start at zero when the up arrow is pressed for an empty value', function () {
            changeInputValueTo(element, '');
            triggerKeyDown(element, 38);
            expect(getElementValue(element)).toEqual('1');
            expect($scope.input).toEqual(1);
        });

        it('shoult start at zero when the down arrow is pressed for an empty value', function () {
            changeInputValueTo(element, '');
            triggerKeyDown(element, 40);
            expect(getElementValue(element)).toEqual('-1');
            expect($scope.input).toEqual(-1);
        })
    });

    describe('mouse navigation', function () {
        var element;

        beforeEach(function () {
           var html = '<numberinput ng-model="input" decimals="0" />';
            element = createInput(html);
        });

        it('should increase the value when the mouse wheel is scrolled up', function  (){
            changeInputValueTo(element, '1')
            triggerMouseWheelEvent(element, 1);
            expect(getElementValue(element)).toEqual('2');
            expect($scope.input).toEqual(2);

            triggerMouseWheelEvent(element, 1);
            expect(getElementValue(element)).toEqual('3');
            expect($scope.input).toEqual(3);
        });

        it('should decrease the value when the mouse wheel is scrolled down', function () {
            changeInputValueTo(element, '2');
            triggerMouseWheelEvent(element, -1);
            expect(getElementValue(element)).toEqual('1');
            expect($scope.input).toEqual(1);

            triggerMouseWheelEvent(element, -1);
            expect(getElementValue(element)).toEqual('0');
            expect($scope.input).toEqual(0);
        });

        it('should start at zero when the mouse wheel is scrolled up for an empty value', function () {
            changeInputValueTo(element, '');
            triggerMouseWheelEvent(element, 1);
            expect(getElementValue(element)).toEqual('1');
            expect($scope.input).toEqual(1);
        });

        it('should start at zero when the mouse wheel is scrolled down for an empty value', function () {
            changeInputValueTo(element, '');
            triggerMouseWheelEvent(element, -1);
            expect(getElementValue(element)).toEqual('-1');
            expect($scope.input).toEqual(-1);
        });
    });

    describe('step setting', function () {
        var element;

        describe('should use the default value of 1', function() {

            beforeEach(function () {
                var html = '<numberinput ng-model="input" />';
                element = createInput(html);
            });

            it('for an increment', function () {
                changeInputValueTo(element, '1');
                triggerKeyDown(element, 38);
                expect(getElementValue(element)).toEqual('2');
                expect($scope.input).toEqual(2);

                triggerMouseWheelEvent(element, 1);
                expect(getElementValue(element)).toEqual('3');
                expect($scope.input).toEqual(3);
            });

            it('for a decrement', function () {
                changeInputValueTo(element, '2');
                triggerKeyDown(element, 40);
                expect(getElementValue(element)).toEqual('1');
                expect($scope.input).toEqual(1);

                triggerMouseWheelEvent(element, -1);
                expect(getElementValue(element)).toEqual('0');
                expect($scope.input).toEqual(0);
            });
        });

        describe('should use the specified value', function () {

            beforeEach(function () {
                var html = '<numberinput ng-model="input" step="10" />';
                element = createInput(html);
            });

            it('for an increment', function () {
                changeInputValueTo(element, '0');
                triggerKeyDown(element, 38);
                expect(getElementValue(element)).toEqual('10');
                expect($scope.input).toEqual(10);

                triggerMouseWheelEvent(element, 1);
                expect(getElementValue(element)).toEqual('20');
                expect($scope.input).toEqual(20);
            });

            it('for a decrement', function () {
                changeInputValueTo(element, '50');
                triggerKeyDown(element, 40);
                expect(getElementValue(element)).toEqual('40');
                expect($scope.input).toEqual(40);

                triggerMouseWheelEvent(element, -1);
                expect(getElementValue(element)).toEqual('30');
                expect($scope.input).toEqual(30);
            });
        });

        describe('should be able to handle JavaScript floating point math', function () {

            it('for an increment', function () {
                var html = '<numberinput ng-model="input" step="0.01" />';
                element = createInput(html);

                changeInputValueTo(element, '0.06');
                triggerKeyDown(element, 38);
                expect(getElementValue(element)).toEqual('0.07'); // can be 0.06999999999999...round properly!
                expect($scope.input).toEqual(0.07);

                changeInputValueTo(element, '0.06');
                triggerMouseWheelEvent(element, 1);
                expect(getElementValue(element)).toEqual('0.07');
                expect($scope.input).toEqual(0.07);
            });
        });

        describe('should be able to handle invalid values', function () {

            it('such as a non-numeric value', function () {
               var element = createInput('<numberinput ng-model="input" step="abc" />');
                changeInputValueTo(element, '1.25');
                triggerKeyDown(element, 38);
                expect(getElementValue(element)).toEqual('2.25');
                expect($scope.input).toEqual(2.25);
            });

            it('such as a value smaller than the minimum (e.g.: decimals = 2, minimum step value = 0.01)', function () {
                var element = createInput('<numberinput ng-model="input" decimals="2" step="0.001" />');
                changeInputValueTo(element, '1.25');
                triggerKeyDown(element, 38);
                expect(getElementValue(element)).toEqual('1.26');
                expect($scope.input).toEqual(1.26);
            });
        });

        it('should update the step if the setting changes', function () {
            element = createInput('<numberinput ng-model="input" step="{{step}}" />');
            $scope.step = 1;
            $scope.input = 10;
            $scope.$apply();

            expect(getElementValue(element)).toEqual('10');
            triggerKeyDown(element, 38);
            expect(getElementValue(element)).toEqual('11');

            $scope.step = 10;
            $scope.$apply();
            expect(getElementValue(element)).toEqual('11');
            triggerKeyDown(element, 38);
            expect(getElementValue(element)).toEqual('21');
            expect($scope.input).toEqual(21);
        });
    });
});