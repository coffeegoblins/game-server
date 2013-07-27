define(['core/utility'], function (Utility)
{
    'use strict';

    // All major browsers besides IE9 support request animation frame
    var vendorTags = ['ms', 'moz', 'webkit', 'o'];
    for (var i = 0; i < vendorTags.length && !window.requestAnimationFrame; i++)
    {
        var vendorTag = vendorTags[i];
        window.requestAnimationFrame = window[vendorTag + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendorTag + 'CancelAnimationFrame'] || window[vendorTag + 'CancelRequestAnimationFrame'];
    }

    // Variables for the main loop
    var updateLoopId;
    var updateMethod;
    var lastUpdateTime = 0;
    var eventQueue = {};

    function Scheduler()
    {
        this.isRunning = false;
        updateMethod = this.update.bind(this);
    }

    Scheduler.prototype.start = function ()
    {
        this.isRunning = true;
        updateLoopId = window.requestAnimationFrame(updateMethod);
    };

    Scheduler.prototype.stop = function ()
    {
        this.isRunning = false;
        window.cancelAnimationFrame(updateLoopId);
    };

    Scheduler.prototype.update = function (time)
    {
        if (!this.isRunning)
            return;

        var deltaTime = (time - lastUpdateTime) * 0.001;
        lastUpdateTime = time;

        // Don't let the game clock sink lower than 20fps
        if (deltaTime > 0.05)
            deltaTime = 0.05;

        // Update any events that have registered with the game
        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent)
        {
            var eventData = currentEvent.eventData;
            eventData.timeRemaining -= deltaTime;
            if (eventData.timeRemaining < 0)
            {
                eventData.method.call(eventData.context, eventData, deltaTime);
                if (eventData.isFinished)
                {
                    previousEvent.next = currentEvent.next;
                    currentEvent = currentEvent.next;
                    continue;
                }
                else
                {
                    eventData.timeRemaining += eventData.interval;
                    if (eventData.timeRemaining < 0)
                        eventData.timeRemaining = 0;
                }
            }

            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }

        updateLoopId = window.requestAnimationFrame(updateMethod);
    };


    Scheduler.prototype.schedule = function (eventData)
    {
        if (eventData && eventData.method)
        {
            if (eventData.interval == null)
                eventData.interval = 0;

            if (eventData.priority == null)
                eventData.priority = this.priority.update;

            eventData.isFinished = false;
            eventData.timeRemaining = eventData.interval;

            var previousEvent = eventQueue;
            var currentEvent = eventQueue.next;
            while (currentEvent && currentEvent.priority < eventData.priority)
            {
                previousEvent = currentEvent;
                currentEvent = currentEvent.next;
            }

            previousEvent.next = {eventData: eventData, next: currentEvent};
        }
    };

    Scheduler.prototype.unschedule = function (eventData)
    {
        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent)
        {
            if (currentEvent.eventData === eventData)
            {
                previousEvent.next = currentEvent.next;
                break;
            }

            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }
    };

    Scheduler.prototype.unscheduleById = function (id)
    {
        var previousEvent = eventQueue;
        var currentEvent = eventQueue.next;
        while (currentEvent)
        {
            if (currentEvent.eventData.id === id)
            {
                previousEvent.next = currentEvent.next;
                break;
            }

            previousEvent = currentEvent;
            currentEvent = currentEvent.next;
        }
    };


    Scheduler.prototype.limitExecution = function ()
    {
        // TODO:
    };

    Scheduler.prototype.throttle = function ()
    {
        // TODO:
    };

    Scheduler.prototype.priority = {
        update: 1,
        render: 2
    };

    return new Scheduler();
});