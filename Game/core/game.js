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

    var scheduledEvents = [];

    function Game()
    {
        this.isRunning = false;
        updateMethod = this.update.bind(this);
    }

    Game.prototype.start = function ()
    {
        this.isRunning = true;
        updateLoopId = window.requestAnimationFrame(updateMethod);
    };

    Game.prototype.stop = function ()
    {
        this.isRunning = false;
        window.cancelAnimationFrame(updateLoopId);
    };

    Game.prototype.update = function (time)
    {
        if (!this.isRunning)
            return;

        var deltaTime = (time - lastUpdateTime) * 0.001;
        lastUpdateTime = time;

        // Don't let the game clock sink lower than 20fps
        if (deltaTime > 0.05)
            deltaTime = 0.05;

        // Update any events that have registered with the game
        for (var i = 0; i < scheduledEvents.length; i++)
        {
            var scheduledEvent = scheduledEvents[i];
            scheduledEvent.timeRemaining -= deltaTime;

            if (scheduledEvent.timeRemaining < 0)
            {
                scheduledEvent.method.call(scheduledEvent.context, deltaTime, scheduledEvent);
                if (scheduledEvent.isFinished)
                {
                    scheduledEvents.splice(i--, 1);
                }
                else
                {
                    scheduledEvent.timeRemaining += scheduledEvent.interval;
                    if (scheduledEvent.timeRemaining < 0)
                        scheduledEvent.timeRemaining = 0;
                }
            }
        }

        updateLoopId = window.requestAnimationFrame(updateMethod);
    };


    Game.prototype.scheduleEvent = function (e)
    {
        if (e && e.method)
        { // TODO: Should I be using an update priority and keeping this sorted?
            if (e.interval == null)
                e.interval = 0;

            e.isFinished = false;
            e.timeRemaining = e.interval;
            scheduledEvents.push(e);
            return e.id;
        }
    };

    Game.prototype.unscheduleEvent = function (e)
    {
        Utility.removeElement(scheduledEvents, e);
    };

    Game.prototype.unscheduleEventById = function (id)
    {
        Utility.removeElementByProperty(scheduledEvents, 'id', id);
    };

    Game.prototype.limitExecution = function ()
    {
        // TODO:
    };

    Game.prototype.throttle = function ()
    {
        // TODO:
    };

    return new Game();
});