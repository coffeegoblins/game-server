module.exports = {
    commonAttackLogic: require('../commonAttackLogic'),
    unitLogic: require('../../unitLogic'),
    attackCost: 50,
    accuracy: 0.9,
    displayName: "Overhead Attack",
    track: "dualStrike",

    damage:
    {
        archer:
        {
            back: 75,
            side: 65,
            front: 55
        },
        shield:
        {
            back: 75,
            side: 65,
            front: 30,
        },
        warrior:
        {
            back: 75,
            side: 65,
            front: 55
        }
    },

    getAttackNodes: function (map, attackingUnit)
    {
        return this.commonAttackLogic.getAttackNodes(map, attackingUnit);
    },

    getTargetNodes: function (tile)
    {
        return this.commonAttackLogic.getSingleTargetNode(tile);
    },

    performAttack: function (attackingUnit, targetNode)
    {
        var targetUnit = targetNode.tile.unit;

        this.unitLogic.applyCombatLock(attackingUnit, targetUnit);

        var damage = this.commonAttackLogic.applyDamage(attackingUnit, targetUnit, this.accuracy, attackingUnit.direction, this.damage);

        return [
            {
                unit: targetUnit,
                damage: damage
            }];
    }
};
