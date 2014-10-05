var GameLogic = require('../gameLogic/gameLogic');
var Utility = require('../utility');

module.exports.perform = function (units, map, action)
{
    var dbAttackingUnit = Utility.getElementByObjectID(units, action.unitID);
    if (!dbAttackingUnit)
    {
        // console.log("The unit " + action.unitID + " does not exist in the database");
        return false;
    }

    var attackLogic = GameLogic.attacks[action.type];
    var attackNodes = attackLogic.getAttackNodes(map, dbAttackingUnit);

    var criteria = {
        x: action.targetX,
        y: action.targetY
    };

    var dbTargetNode = Utility.findInArray(attackNodes, criteria);
    if (!dbTargetNode)
    {
        // console.log("The attack destination is invalid");
        return false;
    }

    var directTargetUnit = dbTargetNode.tile.unit;
    if (directTargetUnit)
    {
        dbAttackingUnit.target = directTargetUnit;
    }

    var targetNodes = attackLogic.getTargetNodes(dbTargetNode);

    if (!GameLogic.hasTarget(targetNodes))
    {
        // console.log("Invalid attack target");
        return false;
    }

    dbAttackingUnit.ap -= GameLogic.getAttackCost(dbAttackingUnit, dbTargetNode, attackLogic.attackCost);

    attackLogic.performAttack(dbAttackingUnit, dbTargetNode);

    return true;
};
