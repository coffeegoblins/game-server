// Mocking dependencies
define('renderer', function ()
{
    function MockRenderer() {}

    function MockCamera() {}

    MockCamera.prototype.moveToUnit = function () {};
    MockRenderer.camera = new MockCamera();

    return MockRenderer;
});

require(['turnManager', 'soldier'], function (TurnManager, Soldier)
{
    'use strict';

    var TurnManagerTest = new TestCase('TurnManagerTest');

    TurnManagerTest.prototype.setUp = function ()
    {
        this.soldierA = new Soldier();
        this.soldierA.Name = "Soldier A";
        this.soldierA.TotalMOV = 10;

        this.soldierB = new Soldier();
        this.soldierB.Name = "Soldier B";
        this.soldierB.TotalMOV = 10;

        this.soldierC = new Soldier();
        this.soldierC.Name = "Soldier C";
        this.soldierC.TotalMOV = 10;

        this.soldierD = new Soldier();
        this.soldierD.Name = "Soldier D";
        this.soldierD.TotalMOV = 10;

        TurnManager.unitList.push(this.soldierA);
        TurnManager.unitList.push(this.soldierB);
        TurnManager.unitList.push(this.soldierC);
        TurnManager.unitList.push(this.soldierD);
    };

    TurnManagerTest.prototype.tearDown = function ()
    {
        TurnManager.unitList = [];
    };

    TurnManagerTest.prototype.testEndTurnWithOtherMovedUnits = function ()
    {
        this.soldierA.MOV = 8;
        this.soldierB.MOV = 10;
        this.soldierC.MOV = 10;
        this.soldierD.MOV = 5;

        TurnManager.endTurn();

        var expectedUnit = TurnManager.unitList[2];

        assertEquals("Soldier A expected at position 2, but it was: " + expectedUnit.Name + "\n", this.soldierA, expectedUnit);
    };

    TurnManagerTest.prototype.testEndTurnIncrementsMOV = function ()
    {
        this.soldierA.MOV = 8;
        this.soldierB.MOV = 10;
        this.soldierC.MOV = 6;
        this.soldierD.MOV = 5;

        TurnManager.endTurn();

        assertEquals(8, this.soldierA.MOV);
        assertEquals(10, this.soldierB.MOV);
        assertEquals(7, this.soldierC.MOV);
        assertEquals(6, this.soldierD.MOV);
    };

    TurnManagerTest.prototype.testEndTurnWithUnmovedUnits = function ()
    {
        this.soldierA.MOV = 10;
        this.soldierB.MOV = 10;
        this.soldierC.MOV = 10;
        this.soldierD.MOV = 10;

        TurnManager.endTurn();

        var lastUnitInQueue = TurnManager.unitList[TurnManager.unitList.length - 1];

        assertEquals("Soldier A expected at the end of the queue, but it was: " + lastUnitInQueue.Name + "\n", this.soldierA, lastUnitInQueue);
    };
});