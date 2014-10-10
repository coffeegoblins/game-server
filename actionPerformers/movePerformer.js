var GameLogic = require('../gameLogic/gameLogic');
var Utility = require('../utility');

module.exports.perform = function (units, map, action)
{
    var dbUnit = Utility.getElementByObjectID(units, action.unitID);
    if (!dbUnit)
    {
        console.log("The unit " + action.unitID + " does not exist in the database");
        return false;
    }

    var moveNodes = GameLogic.getMoveNodes(map, dbUnit);
    var searchCriteria = {
        x: action.x,
        y: action.y
    };

    var destinationNode = Utility.findInArray(moveNodes, searchCriteria);
    if (!destinationNode)
    {
        console.log("The move destination is invalid");
        return false;
    }

    GameLogic.breakCombatLock(dbUnit, Utility.getElementByObjectID(units, dbUnit.target));

    var dbCurrentTile = map.getTile(dbUnit.x, dbUnit.y);
    dbCurrentTile.unit = null;

    dbUnit.ap -= GameLogic.getMoveCost(dbUnit, destinationNode.distance);
    dbUnit.x = destinationNode.x;
    dbUnit.y = destinationNode.y;

    var dbTile = map.getTile(destinationNode.x, destinationNode.y);
    dbTile.unit = dbUnit;

    return true;
};
