var GameLogic = require('../gameLogic/gameLogic');

module.exports.perform = function (units)
{
    // Remove the soldier from the front
    var currentUnit = units.shift();

    // Pay the end turn penalty
    currentUnit.ap *= GameLogic.endTurnPercentageCost;

    var nextUnit = units[0];
    var apIncrement = nextUnit.maxAP - nextUnit.ap;

    // Ensure the next in queue is ready to go
    nextUnit.ap = nextUnit.maxAP;

    // Increment the same amount for all other units
    for (var i = 1; i < units.length; ++i)
    {
        var unit = units[i];
        var missingAP = unit.maxAP - unit.ap;

        // Min() with missing AP to ensure we never go over max AP
        unit.ap += Math.min(apIncrement, missingAP);
    }

    // Place in queue at appropriate spot
    for (var placementIndex = units.length - 1; placementIndex >= 0; --placementIndex)
    {
        var comparisonUnit = units[placementIndex];
        var currentUnitTurnsToMove = currentUnit.maxAP - currentUnit.ap;
        var comparisonUnitTurnsToMove = comparisonUnit.maxAP - comparisonUnit.ap;

        if (currentUnitTurnsToMove >= comparisonUnitTurnsToMove)
        {
            units.splice(placementIndex + 1, 0, currentUnit);
            break;
        }
    }

    // Update turn numbers
    for (i = 0; i < units.length; i++)
    {
        units[i].turnNumber = i + 1;
    }

    return true;
};