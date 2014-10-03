var CommonAttackLogic = require('../commonAttackLogic');

module.exports = {
    UnitLogic: require('../../unitLogic'),
    attackCost: 30,
    accuracy: 0.9,
    displayName: "One-handed Attack",
    track: "dualStrike",
    damage:
    {
        archer: 30,
        shield: 20,
        warrior: 25
    },

    getAttackNodes: CommonAttackLogic.getAttackNodes,

    getTargetNodes: CommonAttackLogic.getSingleTargetNode,

    performAttack: function (attackingUnit, targetNode)
    {
        this.UnitLogic.breakCombatLock(attackingUnit);

        attackingUnit.ap -= CommonAttackLogic.getAttackCost(attackingUnit, targetNode) + this.attackCost;

        var deltaX = targetNode.x - attackingUnit.tileX;
        var deltaY = targetNode.y - attackingUnit.tileY;
        this.UnitLogic.setDirection(attackingUnit, deltaX, deltaY);

        var targetUnit = targetNode.tile.unit;
        if (targetUnit)
        {
            this.UnitLogic.applyCombatLock(attackingUnit);

            if (Math.random() < this.accuracy)
            {
                var damage = this.damage[targetUnit.type];

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