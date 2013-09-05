// Mocking dependencies
define('renderer', function ()
{
    function MockRenderer() {}

    function MockCamera() {}

    MockCamera.prototype.moveToUnit = function () {};

    MockRenderer.camera = new MockCamera();
    MockRenderer.clearRenderablePath = function () {};

    return MockRenderer;
});

require(['src/turnManager', 'src/soldier'], function (TurnManager, Soldier)
{
    'use strict';

    var TurnManagerTest = new TestCase('TurnManagerTest');

    TurnManagerTest.prototype.setUp = function ()
    {
        this.soldierA = new Soldier();
        this.soldierA.name = "Soldier A";
        this.soldierA.maxAP = 10;

        this.soldierB = new Soldier();
        this.soldierB.name = "Soldier B";
        this.soldierB.maxAP = 10;

        this.soldierC = new Soldier();
        this.soldierC.name = "Soldier C";
        this.soldierC.maxAP = 10;

        this.soldierD = new Soldier();
        this.soldierD.name = "Soldier D";
        this.soldierD.maxAP = 10;

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
        this.soldierA.ap = 8;
        this.soldierB.ap = 10;
        this.soldierC.ap = 10;
        this.soldierD.ap = 5;

        TurnManager.endTurn();

        var expectedUnit = TurnManager.unitList[2];

        assertEquals("Soldier A expected at position 2, but it was: " + expectedUnit.name + "\n", this.soldierA, expectedUnit);
    };

    TurnManagerTest.prototype.testEndTurnIncrementsMOV = function ()
    {
        this.soldierA.ap = 8;
        this.soldierB.ap = 10;
        this.soldierC.ap = 6;
        this.soldierD.ap = 5;

        TurnManager.endTurn();

        assertEquals(8, this.soldierA.ap);
        assertEquals(10, this.soldierB.ap);
        assertEquals(7, this.soldierC.ap);
        assertEquals(6, this.soldierD.ap);
    };

    TurnManagerTest.prototype.testEndTurnWithUnmovedUnits = function ()
    {
        this.soldierA.ap = 10;
        this.soldierB.ap = 10;
        this.soldierC.ap = 10;
        this.soldierD.ap = 10;

        TurnManager.endTurn();

        var lastUnitInQueue = TurnManager.unitList[TurnManager.unitList.length - 1];

        assertEquals("Soldier A expected at the end of the queue, but it was: " + lastUnitInQueue.name + "\n", this.soldierA, lastUnitInQueue);
    };
});