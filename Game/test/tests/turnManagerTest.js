define(['Game/src/turnManager', 'Game/src/soldier'], function (TurnManager, Soldier)
{
    'use strict';

    function TurnManagerTest()
    {
        this.name = 'Turn Manager Test';
    }

    TurnManagerTest.prototype.setup = function ()
    {
        this.soldierA = new Soldier();
        this.soldierB = new Soldier();
        this.soldierC = new Soldier();
        this.soldierD = new Soldier();

        this.soldierA.name = "Soldier A";
        this.soldierB.name = "Soldier B";
        this.soldierC.name = "Soldier C";
        this.soldierD.name = "Soldier D";

        this.soldierA.maxAP = 10;
        this.soldierB.maxAP = 10;
        this.soldierC.maxAP = 10;
        this.soldierD.maxAP = 10;

        TurnManager.addUnit(this.soldierA);
        TurnManager.addUnit(this.soldierB);
        TurnManager.addUnit(this.soldierC);
        TurnManager.addUnit(this.soldierD);
    };

    TurnManagerTest.prototype.tearDown = function ()
    {
        TurnManager.unitList.length = 0;
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

    TurnManagerTest.prototype.testEndTurnDoesntIncrementAPWhenNextUnitAtMaxAP = function ()
    {
        this.soldierB.ap = 10;
        this.soldierC.ap = 6;
        this.soldierD.ap = 5;

        TurnManager.endTurn();

        assertEquals(10, this.soldierB.ap);
        assertEquals(6, this.soldierC.ap);
        assertEquals(5, this.soldierD.ap);
    };

    TurnManagerTest.prototype.testAPOnlyIncrementedWhenNeeded = function ()
    {
        this.soldierA.ap = 5;
        this.soldierB.ap = 2;
        this.soldierC.ap = 1;
        this.soldierD.ap = 8;

        TurnManager.incrementAP();

        assertEquals(10, this.soldierA.ap);
        assertEquals(7, this.soldierB.ap);
        assertEquals(6, this.soldierC.ap);
        assertEquals(10, this.soldierD.ap);
    };

    TurnManagerTest.prototype.testEndTurnDecrementsActiveUnitAP = function ()
    {
        this.soldierA.ap = 1;

        var expectedCost = this.soldierA.ap * TurnManager.endTurnPercentageCost;

        TurnManager.endTurn();

        // Soldier B through D are incremented by 5
        assertEquals(expectedCost, this.soldierA.ap);
    };

    return TurnManagerTest;
});