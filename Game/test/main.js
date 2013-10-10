require(
    [
        'TestFramework/testRunner',
        './mapTest',
        './pathManagerTest',
        './schedulerTest',
        './turnManagerTest',
        './utilityTest'
    ],
    function (TestRunner, MapTest, PathManagerTest, SchedulerTest, TurnManagerTest, UtilityTest)
    {
        'use strict';

        TestRunner.runTests([
            new MapTest(),
            new PathManagerTest(),
            new SchedulerTest(),
            new TurnManagerTest(),
            new UtilityTest()
        ]);
    });