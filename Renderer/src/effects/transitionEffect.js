define(['Game/src/scheduler'],
    function (Scheduler)
    {
        'use strict';
        function TransitionEffect()
        {

        }

        TransitionEffect.prototype.transitionFloat = function (id, source, styleName, suffix, targetValue, seconds, context, callback)
        {
            // Stop existing operation on that style's value
            Scheduler.unscheduleById(id);

            var currentValue = parseFloat(source[styleName]);

            this.transitionEvent = {
                id: id,
                source: source,
                styleName: styleName,
                suffix: suffix,
                currentValue: currentValue,
                targetValue: targetValue,
                deltaValue: targetValue - currentValue,
                totalTime: seconds,
                endTime: seconds,
                context: this,
                method: onValueUpdate,
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

            eventData.source[eventData.styleName] = value;
        }

        function onValueUpdateCompleted(eventData, deltaTime)
        {
            var value = eventData.currentValue;
            if (eventData.suffix)
            {
                value += eventData.suffix;
            }

            eventData.source[eventData.styleName] = value;

            if (eventData.callbackMethod)
                eventData.callbackMethod.call(eventData.callbackContext);
        }

        return new TransitionEffect();
    });
