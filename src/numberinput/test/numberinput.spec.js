'use strict'

describe('numberinput', function () {
    var $scope,
        changeInputValueTo;

    beforeEach(module('ui.cg.numberinput'));
    beforeEach(module('ui.cg.focused'));
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

    function focus(element) {
        var input = element.find('input').eq(0);
        input.triggerHandler('focus');
    }

    function blur(element) {
        var input = element.find('input').eq(0);
        input.triggerHandler('blur');
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

    function getUpArrow(element) {
        return element.find('button').eq(0);
    }

    function getDownArrow(element) {
        return element.find('button').eq(1);
    }

    function doClick(arrow) {
        var e = $.Event('click');
        arrow.trigger(e);
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
        var element;

        beforeEach(function () {
            element = createInput('<numberinput ng-model="input" name="foobar" class="span12" />');
        });

        it('contains one input & two buttons', function () {
            expect(element.find('input').length).toEqual(1);
            expect(element.find('button').length).toEqual(2);
        });

        it('input element should have a name if set', function () {
            expect(element.attr('name')).toEqual('foobar');
        });

        it('should be rendered correctly upon creation', function () {
            expect(getElementValue(element)).toEqual('0.00');
        });

        it('should not show the spinner if turned off', function () {
            element = createInput('<numberinput ng-model="input" spinner="false" />');
            var spinner = element.find('span.btn-group');
            expect(spinner.hasClass('ng-hide')).toBeTruthy();
        });

        it('should show the spinner by default', function () {
            var spinner = element.find('span.btn-group');
            expect(spinner.hasClass('ng-hide')).toBeFalsy();
        });

        it('should toggle the spinner if the spinner setting changes', function () {
            element = createInput('<numberinput ng-model="input" spinner="{{spinner}}" />');
            var spinner = element.find('span.btn-group');
            $scope.spinner = false;
            $scope.$apply();
            expect(spinner.hasClass('ng-hide')).toBeTruthy();

            $scope.spinner = true;
            $scope.$apply();
            expect(spinner.hasClass('ng-hide')).toBeFalsy();

            $scope.spinner = false;
            $scope.$apply();
            expect(spinner.hasClass('ng-hide')).toBeTruthy();
        });

        it('increases the value when the up arrow is clicked', function () {
            changeInputValueTo(element, '1');
            var arrow = getUpArrow(element);
            doClick(arrow);
            expect(getElementValue(element)).toEqual('2.00');
            expect($scope.input).toEqual(2);
        });

        it('decreases the value when the down arrow is clicked', function () {
            changeInputValueTo(element, '10');
            var arrow = getDownArrow(element);
            doClick(arrow);
            expect(getElementValue(element)).toEqual('9.00');
            expect($scope.input).toEqual(9);
        });

        it('should apply the class on the input', function () {
            var input = element.find('input').eq(0);
            expect(input.hasClass('span12')).toBeTruthy();
        });

    });

    describe('with default settings', function () {
        var element;

        beforeEach(function () {
            element = createInput('<numberinput ng-model="input" />');
        });

        it('should only accept numbers as input', function () {
            changeInputValueTo(element, '1a2b3c4d5e');
            expect(getElementValue(element)).toEqual('12345.00');
        });

        it('should accept a dot (.) as a decimal separator', function () {
            changeInputValueTo(element, '1.25');
            expect(getElementValue(element)).toEqual('1.25');
        });

        it('should not accept anything but a dot (.) as a decimal separator', function () {
            changeInputValueTo(element, '1,25');
            expect(getElementValue(element)).toEqual('125.00');
            expect($scope.input).toEqual(125);
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
            expect(getElementValue(element)).toEqual('-56.00');
            expect($scope.input).toEqual(-56);

            changeInputValueTo(element, '56---78---91');
            expect(getElementValue(element)).toEqual('567891.00');
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

        it('should always accept the numeric keypad dot as a decimal separator', function () {

            var element = createInput( '<numberinput ng-model="input" decimal-separator="," />');
            focus(element);
            changeInputValueTo(element, '10.');
            expect(getElementValue(element)).toEqual('10,');
        });

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

        it('should be disabled if explicitly turned off', function () {
            element = createInput('<numberinput ng-model="input" keyboard="false" />');
            changeInputValueTo(element, '1');
            expect($scope.input).toEqual(1);

            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(1);

            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(1);
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

        it('should be disabled if explicitly turned off', function () {
            element = createInput('<numberinput ng-model="input" mousewheel="false" />');
            changeInputValueTo(element, '1');
            expect($scope.input).toEqual(1);

            triggerMouseWheelEvent(element, 1);
            expect($scope.input).toEqual(1);

            triggerMouseWheelEvent(element, -1);
            expect($scope.input).toEqual(1);
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
                expect(getElementValue(element)).toEqual('2.00');
                expect($scope.input).toEqual(2);

                triggerMouseWheelEvent(element, 1);
                expect(getElementValue(element)).toEqual('3.00');
                expect($scope.input).toEqual(3);
            });

            it('for a decrement', function () {
                changeInputValueTo(element, '2');
                triggerKeyDown(element, 40);
                expect(getElementValue(element)).toEqual('1.00');
                expect($scope.input).toEqual(1);

                triggerMouseWheelEvent(element, -1);
                expect(getElementValue(element)).toEqual('0.00');
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
                expect(getElementValue(element)).toEqual('10.00');
                expect($scope.input).toEqual(10);

                triggerMouseWheelEvent(element, 1);
                expect(getElementValue(element)).toEqual('20.00');
                expect($scope.input).toEqual(20);
            });

            it('for a decrement', function () {
                changeInputValueTo(element, '50');
                triggerKeyDown(element, 40);
                expect(getElementValue(element)).toEqual('40.00');
                expect($scope.input).toEqual(40);

                triggerMouseWheelEvent(element, -1);
                expect(getElementValue(element)).toEqual('30.00');
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

            expect(getElementValue(element)).toEqual('10.00');
            triggerKeyDown(element, 38);
            expect(getElementValue(element)).toEqual('11.00');

            $scope.step = 10;
            $scope.$apply();
            expect(getElementValue(element)).toEqual('11.00');
            triggerKeyDown(element, 38);
            expect(getElementValue(element)).toEqual('21.00');
            expect($scope.input).toEqual(21);
        });
    });

    describe('maximum setting', function () {
        var element;

        beforeEach(function() {
            element = createInput('<numberinput ng-model="input" maximum="100" />');
        });

        it('should revert to the maximum value on blur if the entered value exceeds the maximium', function () {
            changeInputValueTo(element, '300');
            blur(element);
            expect(getElementValue(element)).toEqual('100.00');
            expect($scope.input).toEqual(100);
        });

        it('should not exceed the maximum value on step', function () {
            // keyboard
            changeInputValueTo(element, '99');
            expect($scope.input).toEqual(99);
            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(100);
            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(100);

            // by mouse wheel
            changeInputValueTo(element, '99');
            expect($scope.input).toEqual(99);
            triggerMouseWheelEvent(element, 1);
            expect($scope.input).toEqual(100);
            triggerMouseWheelEvent(element, 1);
            expect($scope.input).toEqual(100);

            // spin buttons
            changeInputValueTo(element, '99');
            expect($scope.input).toEqual(99);
            var arrow = getUpArrow(element);
            doClick(arrow);
            expect($scope.input).toEqual(100);
            doClick(arrow);
            expect($scope.input).toEqual(100);
        });

        it('should revert to maximum value on keyboard navigation if the entered value exceeds the maximum', function() {
            changeInputValueTo(element, '200');
            expect($scope.input).toEqual(200);
            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(100);

            changeInputValueTo(element, '200');
            expect($scope.input).toEqual(200);
            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(100);
        });

        it('should revert to maximum value on mouse navigation if the entered value exceeds the maximum', function() {
            changeInputValueTo(element, '200');
            expect($scope.input).toEqual(200);
            triggerMouseWheelEvent(element, 1);
            expect($scope.input).toEqual(100);

            changeInputValueTo(element, '200');
            expect($scope.input).toEqual(200);
            triggerMouseWheelEvent(element, -1);
            expect($scope.input).toEqual(100);
        });

        it('should revert to maximum value on spin button navigation if the entered value exceeds the maximum', function() {
            changeInputValueTo(element, '200');
            expect($scope.input).toEqual(200);
            blur(element);
            var arrow = getUpArrow(element);
            doClick(arrow);
            expect($scope.input).toEqual(100);

            changeInputValueTo(element, '200');
            expect($scope.input).toEqual(200);
            blur(element);
            var arrow = getDownArrow(element);
            doClick(arrow);
            expect($scope.input).toEqual(99);
        });

        it('should update the maximum if the setting changes', function () {
            element = createInput('<numberinput ng-model="input" maximum="{{maximum}}" />');
            $scope.maximum = 100;
            $scope.input = 99;
            $scope.$apply();

            expect($scope.input).toEqual(99);
            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(100);

            $scope.maximum = 101;
            $scope.$apply();
            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(101);
        });
    });

    describe('minimum setting', function () {
        var element;

        beforeEach(function () {
           element = createInput('<numberinput ng-model="input" minimum="10" />');
        });

        it('should revert to the minimum value on blur if the entered value exceeds the minimum', function () {
            changeInputValueTo(element, '9');
            blur(element);
            expect(getElementValue(element)).toEqual('10.00');
            expect($scope.input).toEqual(10);
        });

        it('should not exceed the minimum value on step', function () {
            // keyboard
            changeInputValueTo(element, '11');
            expect($scope.input).toEqual(11);
            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(10);
            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(10);

            // mouse
            changeInputValueTo(element, '11');
            expect($scope.input).toEqual(11);
            triggerMouseWheelEvent(element, -1);
            expect($scope.input).toEqual(10);
            triggerMouseWheelEvent(element, -1);
            expect($scope.input).toEqual(10);

            // spin buttons
            changeInputValueTo(element, '11');
            expect($scope.input).toEqual(11);
            var arrow = getDownArrow(element);
            doClick(arrow);
            expect($scope.input).toEqual(10);
            doClick(arrow);
            expect($scope.input).toEqual(10);
        });

        it('should revert to the minimum value on keyboard navigation if the entered value exceeds the minimum', function () {
            changeInputValueTo(element, '5');
            expect($scope.input).toEqual(5);
            triggerKeyDown(element, 38);
            expect($scope.input).toEqual(10);

            changeInputValueTo(element, '5');
            expect($scope.input).toEqual(5);
            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(10);
        });

        it('should revert to the minimum value on mouse navigation if the entered value exceeds the minimum', function () {
            changeInputValueTo(element, '5');
            expect($scope.input).toEqual(5);
            triggerMouseWheelEvent(element, 1);
            expect($scope.input).toEqual(10);

            changeInputValueTo(element, '5');
            expect($scope.input).toEqual(5);
            triggerMouseWheelEvent(element, -1);
            expect($scope.input).toEqual(10);
        });

        it('should revert to the minimum value on spin button navigation if the entered value exceeds the minimum', function () {
            changeInputValueTo(element, '5');
            expect($scope.input).toEqual(5);
            blur(element);
            var arrow = getUpArrow(element);
            doClick(arrow);
            expect($scope.input).toEqual(11);

            changeInputValueTo(element, '5');
            expect($scope.input).toEqual(5);
            blur(element);
            var arrow = getDownArrow(element);
            doClick(arrow);
            expect($scope.input).toEqual(10);
        });

        it('should update the minimum if the setting changes', function () {
            element = createInput('<numberinput ng-model="input" minimum="{{minimum}}" />');
            $scope.minimum = 10;
            $scope.input = 10;
            $scope.$apply();

            expect($scope.input).toEqual(10);
            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(10);

            $scope.minimum = 9;
            $scope.$apply();
            triggerKeyDown(element, 40);
            expect($scope.input).toEqual(9);
        });
    });

    describe('ng-disabled setting', function () {
        var element;

        beforeEach(function () {
            element = createInput('<numberinput ng-model="input" ng-disabled="disabled" />');
            $scope.disabled = true;
            $scope.$apply();
        });

        it('should disable the input', function () {
            var input = element.find('input').eq(0);
            expect(input.is(':disabled')).toBeTruthy();
        });

        it('should disable the spin buttons', function () {
            var upArrow = getUpArrow(element);
            expect(upArrow.is(':disabled')).toBeTruthy();
            var downArrow = getDownArrow(element);
            expect(downArrow.is(':disabled')).toBeTruthy();
        });

        it('should disable the mouse navigation', function () {
            changeInputValueTo(element, '10');
            expect(getElementValue(element)).toEqual('10');

            triggerMouseWheelEvent(element, 1);
            expect(getElementValue(element)).toEqual('10');

            triggerMouseWheelEvent(element, -1);
            expect(getElementValue(element)).toEqual('10');
        });

        it('should disable the keyboard navigation', function () {
            changeInputValueTo(element, '10');
            expect(getElementValue(element)).toEqual('10');

            triggerKeyDown(element, 38);
            expect(getElementValue(element)).toEqual('10');

            triggerKeyDown(element, 40);
            expect(getElementValue(element)).toEqual('10');
        });

        it('should enable the controls if the setting changes', function () {
            var input = element.find('input').eq(0);
            var upArrow = getUpArrow(element);
            var downArrow = getDownArrow(element);

            $scope.disabled = false;
            $scope.$apply();
            expect(input.is(':disabled')).toBeFalsy();
            expect(upArrow.is(':disabled')).toBeFalsy();
            expect(downArrow.is(':disabled')).toBeFalsy();

            $scope.disabled = true;
            $scope.$apply();
            expect(input.is(':disabled')).toBeTruthy();
            expect(upArrow.is(':disabled')).toBeTruthy();
            expect(downArrow.is(':disabled')).toBeTruthy();
        });
    });

    describe('ng-required setting', function () {
        var element;

        beforeEach(function () {
            element = createInput('<numberinput ng-model="input" ng-required="true" />');
            $scope.disabled = true;
            $scope.$apply();
        });

        it('should set the required attribute', function () {
            expect(element.attr('ng-required')).toBeDefined();
            expect(element.attr('required')).toBeDefined();
        });

        it('should require a value', function () {
            changeInputValueTo(element, '10');
            expect(element.hasClass('ng-valid')).toBeTruthy();
            expect(element.hasClass('ng-valid-required')).toBeTruthy();

            changeInputValueTo(element, '');
            expect(element.hasClass('ng-invalid')).toBeTruthy();
            expect(element.hasClass('ng-invalid-required')).toBeTruthy();
        })
    });

    describe('focused', function () {
        var element;

        beforeEach(function () {
            element = createInput('<form name="form"><numberinput name="input" ng-model="input" /></form>');
            $scope.disabled = true;
            $scope.$apply();
        });

        it('should know when it has focus', function () {
            focus(element);
            expect($scope.form.input.$focused).toBeTruthy();
        });

        it('should know when it has lost focus', function () {
            focus(element);
            expect($scope.form.input.$focused).toBeTruthy();

            blur(element);
            expect($scope.form.input.$focused).toBeFalsy();
        });

        it('should not round when it has focus', function () {
            focus(element);
            $scope.input = 10.1;
            $scope.$apply();
            expect(getElementValue(element)).toEqual('10.1');
        });

        it('should round when it has lost focus', function () {
            $scope.input = 10.1;
            $scope.$apply();
            expect(getElementValue(element)).toEqual('10.10');
        });
    });
});