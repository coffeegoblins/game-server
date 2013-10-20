require(
    [
        'TestFramework/testRunner',
        './eventManagerTest',
        './mapTest',
        './pathManagerTest',
        './schedulerTest',
        './turnManagerTest',
        './utilityTest'
    ],
    function (TestRunner, EventManager, MapTest, PathManagerTest, SchedulerTest, TurnManagerTest, UtilityTest)
    {
        'use strict';

        TestRunner.runTests([
            new EventManager(),
            new MapTest(),
            new PathManagerTest(),
            new SchedulerTest(),
            new TurnManagerTest(),
            new UtilityTest()
        ]);
    });