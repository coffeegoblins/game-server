define(['Game/src/scheduler'],
function (Scheduler)
{
    'use strict';
    function TransitionEffect()
    {

    }

    TransitionEffect.prototype.transitionStyle = function(control, styleName, targetValue, seconds, context, callback)
    {
        // Stop existing operation on that style's value
        Scheduler.unscheduleById(control.id + styleName);

        var currentValue = parseFloat(control.style[styleName]);

        this.transitionEvent = {
            id: control.id + styleName,
            control: control,
            styleName: styleName,
            currentValue: currentValue,
            targetValue: targetValue,
            deltaValue: targetValue - currentValue,
            totalTime: seconds,
            context: this,
            method: onValueUpdate,
            completedContext: this,
            completedMethod: onValueUpdateCompleted,
            callbackContext: context,
            callbackMethod: callback
        };

        Scheduler.schedule(this.transitionEvent);
    };

    function onValueUpdate(eventData, deltaTime)
    {
        eventData.currentValue = eventData.currentValue + eventData.deltaValue * deltaTime / eventData.totalTime;
        eventData.control.style[eventData.styleName] = eventData.currentValue;
    }

    function onValueUpdateCompleted(eventData, deltaTime)
    {
        eventData.control.style[eventData.styleName] = eventData.targetValue;

        if (eventData.callbackMethod)
            eventData.callbackMethod.call(eventData.callbackContext);
    }

    return new TransitionEffect();
});
