define(['./events', './utility'], function (Events, Utility)
{
    'use strict';

    function TurnManager()
    {
        this.unitList = [];
        this.endTurnPercentageCost = 0.75;
    }

    TurnManager.prototype.addUnit = function (unit)
    {
        this.unitList.push(unit);
        unit.on('death', this, this.removeUnit);
    };

    TurnManager.prototype.beginTurn = function ()
    {
        this.activeUnit = this.unitList[0];
        this.trigger('beginTurn', this.activeUnit);
    };

    TurnManager.prototype.incrementAP = function ()
    {
        if (!this.unitList.length)
            return;

        var nextUnit = this.unitList[0];
        var apIncrement = nextUnit.maxAP - nextUnit.ap;

        // Ensure the next in queue is ready to go
        nextUnit.ap = nextUnit.maxAP;

        // Increment the same amount for all other units
        for (var i = 1; i < this.unitList.length; ++i)
        {
            var unit = this.unitList[i];
            var missingAP = unit.maxAP - unit.ap;

            // Min() with missing AP to ensure we never go over max AP
            unit.ap += Math.min(apIncrement, missingAP);
        }
    };

    TurnManager.prototype.endTurn = function ()
    {
        // Remove the soldier from the front
        var currentUnit = this.unitList.shift();

        // Pay the end turn penalty
        currentUnit.ap *= this.endTurnPercentageCost;

        this.incrementAP();

        // Place in queue at appropriate spot
        for (var placementIndex = this.unitList.length - 1; placementIndex >= 0; --placementIndex)
        {
            var comparisonUnit = this.unitList[placementIndex];

            var currentUnitTurnsToMove = currentUnit.maxAP - currentUnit.ap;
            var comparisonUnitTurnsToMove = comparisonUnit.maxAP - comparisonUnit.ap;

            if (currentUnitTurnsToMove >= comparisonUnitTurnsToMove)
            {
                this.unitList.splice(placementIndex + 1, 0, currentUnit);
                break;
            }
        }

        this.activeUnit = null;
        this.trigger('endTurn', currentUnit, placementIndex + 1);
    };

    TurnManager.prototype.removeUnit = function (unit)
    {
        Utility.removeElement(this.unitList, unit);
    };

    Events.register(TurnManager.prototype);
    return TurnManager;
});
