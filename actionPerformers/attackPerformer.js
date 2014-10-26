var GameLogic = require('../gameLogic/gameLogic');
var Utility = require('../utility');

module.exports.perform = function (game, map, action)
{
    var dbAttackingUnit = Utility.getElementByObjectID(game.units, action.unitID);
    if (!dbAttackingUnit)
    {
        console.log("The unit " + action.unitID + " does not exist in the database");
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
        console.log("The attack destination is invalid");
        return false;
    }

    var targetNodes = attackLogic.getTargetNodes(dbTargetNode);
    if (!GameLogic.hasTarget(targetNodes))
    {
        console.log("Invalid attack target");
        return false;
    }

    dbAttackingUnit.target = dbTargetNode.tile.unit._id;
    dbAttackingUnit.direction = GameLogic.getDirection(dbAttackingUnit, dbTargetNode);
    dbAttackingUnit.ap -= GameLogic.getAttackCost(dbAttackingUnit, dbTargetNode, attackLogic.attackCost);

    var dbHitChance = GameLogic.nextRandom(game);

    action.results = attackLogic.performAttack(dbAttackingUnit, dbTargetNode, dbHitChance);

    return true;
};
