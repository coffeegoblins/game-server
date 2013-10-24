define([
    './tests/attackManagerTest',
    './tests/eventManagerTest',
    './tests/mapTest',
    './tests/pathManagerTest',
    './tests/schedulerTest',
    './tests/turnManagerTest',
    './tests/utilityTest'
], function (AttackManagerTest, EventTest, MapTest, PathManagerTest, SchedulerTest, TurnManagerTest, UtilityTest)
{
    'use strict';
    return [
        new AttackManagerTest(),
        new EventTest(),
        new MapTest(),
        new PathManagerTest(),
        new SchedulerTest(),
        new TurnManagerTest(),
        new UtilityTest()
    ];
});