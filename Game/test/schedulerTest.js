require(['src/scheduler'], function (Scheduler)
{
    'use strict';

    var SchedulerTest = new AsyncTestCase('SchedulerTest');

    SchedulerTest.prototype.setUp = function ()
    {
        Scheduler.start();
    };

    SchedulerTest.prototype.tearDown = function ()
    {
        Scheduler.stop();
        Scheduler.clear();
    };

    SchedulerTest.prototype.testSchedule = function (queue)
    {
        var wasExecuted;

        queue.call('Scheduling the event', function (callbacks)
        {
            var scheduledEvent = {};
            scheduledEvent.method = callbacks.add(function () { wasExecuted = true; });

            Scheduler.schedule(scheduledEvent);
        });

        queue.call('Verifying that the scheduled method was called', function ()
        {
            assertTrue(wasExecuted);
        });
    };

    SchedulerTest.prototype.testUnschedule = function (queue)
    {
        var wasExecuted;

        queue.call('Scheduling the event', function ()
        {
            var scheduledEvent = {};
            scheduledEvent.method = function () { wasExecuted = true; };

            Scheduler.schedule(scheduledEvent);
            Scheduler.unschedule(scheduledEvent);
        });

        queue.call("Verifying that the scheduled method wasn't called", function ()
        {
            assertUndefined(wasExecuted);
        });
    };

    SchedulerTest.prototype.testUnscheduleById = function (queue)
    {
        var wasExecuted;

        queue.call('Scheduling the event', function ()
        {
            var scheduledEvent = {id: 'testEvent'};
            scheduledEvent.method = function () { wasExecuted = true; };

            Scheduler.schedule(scheduledEvent);
            Scheduler.unscheduleById('testEvent');
        });

        queue.call("Verifying that the scheduled method wasn't called", function ()
        {
            assertUndefined(wasExecuted);
        });
    };

    SchedulerTest.prototype.testPriority = function (queue)
    {
        var executionOrder = [];

        queue.call('Scheduling the events', function (callbacks)
        {
            var scheduledEvent1 = {priority: 1};
            scheduledEvent1.method = callbacks.add(function () {
                executionOrder.push('method1');
            });

            var scheduledEvent2 = {priority: 3};
            scheduledEvent2.method = callbacks.add(function () {
                executionOrder.push('method2');
            });

            var scheduledEvent3 = {priority: 2};
            scheduledEvent3.method = callbacks.add(function () {
                executionOrder.push('method3');
            });

            Scheduler.schedule(scheduledEvent1);
            Scheduler.schedule(scheduledEvent2);
            Scheduler.schedule(scheduledEvent3);
        });

        queue.call('Verifying that the methods were called in the right order', function ()
        {
            assertEquals('method2', executionOrder[0]);
            assertEquals('method3', executionOrder[1]);
            assertEquals('method1', executionOrder[2]);
        });
    };
});