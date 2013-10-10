define(['Game/src/scheduler'], function (Scheduler)
{
    'use strict';

    function SchedulerTest()
    {
        this.name = 'Scheduler Test';
    }

    SchedulerTest.prototype.setup = function ()
    {
        Scheduler.start();
    };

    SchedulerTest.prototype.tearDown = function ()
    {
        Scheduler.stop();
        Scheduler.clear();
    };

    SchedulerTest.prototype.testIntervalMethodIsCalled = function ()
    {
        var wasExecuted = false;
        Scheduler.schedule({method: function () { wasExecuted = true; }});

        async(function ()
        {
            return wasExecuted;
        }, 'Scheduled event was not called', 100);
    };

    SchedulerTest.prototype.testCompletedMethodIsCalledWhenEndTimeSet = function ()
    {
        var wasExecuted = false;
        Scheduler.schedule({endTime: 0, completedMethod: function () { wasExecuted = true; }});

        async(function ()
        {
            return wasExecuted;
        }, 'Scheduled event was not called', 100);
    };

    SchedulerTest.prototype.testUnscheduleRemovesEvent = function ()
    {
        var wasExecuted = false;
        var scheduledEvent = {method: function () { wasExecuted = true; }};

        Scheduler.schedule(scheduledEvent);
        Scheduler.unschedule(scheduledEvent);

        asyncWait(100);
        async(function ()
        {
            assertFalsy(wasExecuted);
        });
    };

    SchedulerTest.prototype.testUnscheduleById = function ()
    {
        var wasExecuted;
        Scheduler.schedule({id: 'testEvent', method: function () { wasExecuted = true; }});
        Scheduler.unscheduleById('testEvent');

        asyncWait(100);
        async(function ()
        {
            assertFalsy(wasExecuted);
        });
    };

    SchedulerTest.prototype.testPriority = function ()
    {
        var executionOrder = [];
        Scheduler.schedule({priority: 1, method: function () { executionOrder.push('method1'); }});
        Scheduler.schedule({priority: 3, method: function () { executionOrder.push('method2'); }});
        Scheduler.schedule({priority: 2, method: function () { executionOrder.push('method3'); }});

        async(function ()
        {
            return executionOrder.length === 3;
        }, 'The scheduled events were not called');

        async(function ()
        {
            assertEquals('method2', executionOrder[0]);
            assertEquals('method3', executionOrder[1]);
            assertEquals('method1', executionOrder[2]);
        });
    };

    return SchedulerTest;
});