require(
    [
        'TestFramework/testRunner',
        './attackManagerTest',
        './eventManagerTest',
        './mapTest',
        './pathManagerTest',
        './schedulerTest',
        './turnManagerTest',
        './utilityTest'
    ],
    function (TestRunner, AttackManagerTest, EventTest, MapTest, PathManagerTest, SchedulerTest, TurnManagerTest, UtilityTest)
    {
        'use strict';

        TestRunner.runTests([
            new AttackManagerTest(),
            new EventTest(),
            new MapTest(),
            new PathManagerTest(),
            new SchedulerTest(),
            new TurnManagerTest(),
            new UtilityTest()
        ]);
    });