var CommonAttackLogic = require('../commonAttackLogic');

module.exports = {
    UnitLogic: require('../../unitLogic'),
    OcclusionCalculator: require('../../occlusionCalculator'),
    maxRange: 10,
    attackCost: 20,
    minRange: 1.9,
    track: "bow1",
    displayName: "Short Attack",
    damage:
    {
        archer: 30,
        shield: 20,
        warrior: 25
    },
    accuracy:
    {
        archer: 0.75,
        rogue: 0.5,
        shield: 0.2,
        warrior: 0.9
    },

    getAttackNodes: function (map, attackingUnit)
    {
        var tileNodes = CommonAttackLogic.getTileNodes(map, attackingUnit, this.minRange, this.maxRange);

        var occlusionQuads = this.OcclusionCalculator.getOcclusionQuads(tileNodes, attackingUnit, this.maxRange);
        this.OcclusionCalculator.occludeTiles(occlusionQuads, tileNodes);

        return tileNodes;
    },

    getTargetNodes: CommonAttackLogic.getSingleTargetNode,

    performAttack: function (attackingUnit, targetNode)
    {
        attackingUnit.ap -= CommonAttackLogic.getAttackCost(attackingUnit, targetNode) + this.attackCost;

        var deltaX = targetNode.x - attackingUnit.tileX;
        var deltaY = targetNode.y - attackingUnit.tileY;
        this.UnitLogic.setDirection(attackingUnit, deltaX, deltaY);

        var targetUnit = targetNode.tile.unit;
        if (targetUnit)
        {
            var unitType = targetUnit.type;
            var damage = this.damage[unitType];
            var accuracy = this.accuracy[unitType];

            if (targetNode.occlusionPercentage)
            {
                accuracy *= (1 - targetNode.occlusionPercentage);
            }

            if (Math.random() < accuracy)
            {
                var attackDirection = Math.atan2(deltaX, deltaY);
                var targetDirection = Math.atan2(targetUnit.worldDirection.x, targetUnit.worldDirection.y);

                var directionDelta = Math.abs(Math.abs(attackDirection - targetDirection) - Math.PI);
                if (directionDelta > Math.PI * 0.66)
                {
                    // The attack was from behind
                    damage *= 2;
                }
                else if (directionDelta > Math.PI * 0.33)
                {
                    // The attack was from the side
                    damage *= 1.5;
                }

                targetUnit.damage(damage);

                return [
                    {
                        unit: targetUnit,
                        damage: damage
                }];
            }
        }
    }
};