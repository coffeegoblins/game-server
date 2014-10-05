//AttackLogic.calculateCrossNodes = function (unit, selectedNode, availableNodes)
//{
//    var crossNodes = [];
//    var x = selectedNode.x;
//    var y = selectedNode.y;
//
//    for (var i = 0; i < availableNodes.length; ++i)
//    {
//        var node = availableNodes[i];
//        if (node.tile.unit !== unit &&
//            (node.x === x && Math.abs(node.y - y) === 1) ||
//            (node.y === y && Math.abs(node.x - x) === 1))
//        {
//            crossNodes.push(node);
//        }
//    }
//
//    return crossNodes;
//};

//AttackLogic.performAttack = function (unit, attack, targetTile, affectedTiles)
//{
//    this.breakCombatLock(unit);
//    unit.ap -= this.getAttackCost(unit, attack, targetTile);
//
//    var deltaX = targetTile.x - unit.x;
//    var deltaY = targetTile.y - unit.y;
//    unit.setDirection(deltaX, deltaY);
//
//    var targets = [];
//    for (var i = 0; i < affectedTiles.length; i++)
//    {
//        var tileNode = affectedTiles[i];
//        var targetUnit = tileNode.tile.unit;
//        if (targetUnit)
//        {
//            deltaX = targetUnit.x - unit.x;
//            deltaY = targetUnit.y - unit.y;
//
//            // Apply combat lock
//            if (!targetUnit.target)
//            {
//                targetUnit.setDirection(-deltaX, -deltaY);
//
//                // Don't lock units attacked from a distance
//                if (Math.abs(deltaX) + Math.abs(deltaY) === 1)
//                {
//                    unit.target = targetUnit;
//                    targetUnit.target = unit;
//                }
//            }
//
//            var damage;
//            var unitType = targetUnit.type;
//            var accuracy = attack.accuracy[unitType] || attack.accuracy;
//
//            if (tileNode.occlusionPercentage)
//                accuracy *= (1 - tileNode.occlusionPercentage);
//
//            if (Math.random() < accuracy)
//            {
//                damage = attack.damage[unitType] || attack.damage;
//                var attackDirection = Math.atan2(deltaX, deltaY);
//                var targetDirection = Math.atan2(targetUnit.worldDirection.x, targetUnit.worldDirection.y);
//
//                var directionDelta = Math.abs(Math.abs(attackDirection - targetDirection) - Math.PI);
//                if (directionDelta > Math.PI * 0.66)
//                { // The attack was from behind
//                    damage *= attack.backDamage || 2;
//                }
//                else if (directionDelta > Math.PI * 0.33)
//                { // The attack was from the side
//                    damage *= attack.sideDamage || 1.5;
//                }
//
//                targetUnit.damage(damage);
//
//                if (attack.breakCombatLock)
//                    this.breakCombatLock(targetUnit);
//            }
//
//            targets.push(
//            {
//                unit: targetUnit,
//                damage: damage
//            });
//        }
//    }
//
//    return targets;
//};

// var attackLogic = new AttackLogic();

//attackLogic.attacks = ;

var CommonAttackLogic = require('./commonAttackLogic');

module.exports = {
    hasTarget: CommonAttackLogic.hasTarget,
    getAttackCost: CommonAttackLogic.getAttackCost,
    getAttackNodes: CommonAttackLogic.getAttackNodes,
    attacks:
    {
        shortBow: require('./attacks/shortBowAttackLogic'),
        oneHanded: require('./attacks/oneHandedAttackLogic')
    }
};
