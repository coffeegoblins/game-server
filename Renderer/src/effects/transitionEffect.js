define(['Game/src/scheduler'],
    function (Scheduler)
    {
        'use strict';
        function TransitionEffect()
        {

        }

        TransitionEffect.prototype.transitionFloat = function (control, styleName, suffix, targetValue, seconds, context, callback)
        {
            // Stop existing operation on that style's value
            Scheduler.unscheduleById(control.id + styleName);

            var currentValue = parseFloat(control.style[styleName]);

            this.transitionEvent = {
                id: control.id + styleName,
                control: control,
                styleName: styleName,
                suffix: suffix,
                currentValue: currentValue,
                targetValue: targetValue,
                deltaValue: targetValue - currentValue,
                totalTime: seconds,
                endTime: seconds,
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

            var value = eventData.currentValue;
            if (eventData.suffix)
            {
                value += eventData.suffix;
            }

            eventData.control.style[eventData.styleName] = value;
        }

        function onValueUpdateCompleted(eventData, deltaTime)
        {
            var value = eventData.currentValue;
            if (eventData.suffix)
            {
                value += eventData.suffix;
            }

            eventData.control.style[eventData.styleName] = value;

            if (eventData.callbackMethod)
                eventData.callbackMethod.call(eventData.callbackContext);
        }

        return new TransitionEffect();
    });
