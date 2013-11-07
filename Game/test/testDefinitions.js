define([
    './tests/attackManagerTest',
    './tests/eventManagerTest',
    './tests/inputHandlerTest',
    './tests/mapTest',
    './tests/pathManagerTest',
    './tests/schedulerTest',
    './tests/turnManagerTest',
    './tests/utilityTest'
], function (AttackManagerTest, EventTest, InputHandlerTest, MapTest, PathManagerTest, SchedulerTest, TurnManagerTest, UtilityTest)
{
    'use strict';
    return [
        new AttackManagerTest(),
        new EventTest(),
        new InputHandlerTest(),
        new MapTest(),
        new PathManagerTest(),
        new SchedulerTest(),
        new TurnManagerTest(),
        new UtilityTest()
    ];
});