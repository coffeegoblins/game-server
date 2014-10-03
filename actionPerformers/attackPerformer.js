var GameLogic = require('../gameLogic/gameLogic');
var Utility = require('../utility');

module.exports.perform = function (units, map, action)
{
    var dbAttackingUnit = Utility.getElementByObjectID(units, action.unitID);
    if (!dbAttackingUnit)
    {
        // TODO Replace With Logging - console.log("The unit " + action.unitID + " does not exist in the database");
        return false;
    }

    var attackNodes = GameLogic.attacks[action.type].getAttackNodes(map, dbAttackingUnit);

    var criteria = {
        x: action.targetTile.x,
        y: action.targetTile.y
    };

    var dbAttackNode = Utility.findInArray(attackNodes, criteria);
    if (!dbAttackNode)
    {
        // TODO Replace With Logging - console.log("The attack destination is invalid");
        return false;
    }

    var targetNodes = GameLogic.attacks[action.type].getTargetNodes(action.selectedTile);
    if (!GameLogic.commonAttackLogic.hasTarget(targetNodes))
    {
        // TODO Replace With Logging - console.log("Invalid attack target");
        return false;
    }

    // TODO Validate affected tiles
    GameLogic.attacks[action.type].performAttack(dbAttackingUnit, dbAttackNode, action.affectedTiles);

    return true;
};