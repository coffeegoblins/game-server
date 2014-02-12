define(['Renderer/src/effects/transitionEffect', 'Core/src/scheduler'], function (TransitionEffect, Scheduler)
{
    'use strict';

    function TransitionEffectTest()
    {
        this.name = 'TransitionEffect Test';
    }

    TransitionEffectTest.prototype.setup = function ()
    {
        Scheduler.start();
    };

    TransitionEffectTest.prototype.tearDown = function ()
    {
        Scheduler.stop();
        Scheduler.clear();
    };

    TransitionEffectTest.prototype.testValueIsExact = function ()
    {
        var wasExecuted = false;
        var expectedValue = 1.01235412341;

        var property = [];
        property.value = 0;

        TransitionEffect.transitionFloat({
            property: property,
            duration: 'value',
            targetValue: expectedValue,
            completedMethod: function ()
            {
                wasExecuted = true;
            }
        });

        async(function ()
        {
            if (wasExecuted)
            {
                assertEquals('Value was not exact', expectedValue, property.value);
            }

            return wasExecuted;
        }, 'Scheduled event was not called', 2000);
    };

    TransitionEffectTest.prototype.testSuffixIsUsed = function ()
    {
        var wasExecuted = false;
        var expectedValue = 1;

        var property = [];
        property.value = '0px';

        TransitionEffect.transitionFloat({
            property: property,
            duration: 'value',
            suffix: 'px',
            targetValue: expectedValue,
            completedMethod: function ()
            {
                wasExecuted = true;
            }
        });

        async(function ()
        {
            if (wasExecuted)
            {
                assertEquals('Suffix was not used', expectedValue + 'px', property.value);
            }

            return wasExecuted;
        }, 'Scheduled event was not called', 2000);
    };

    return TransitionEffectTest;
});
