module.exports = {
    commonAttackLogic: require('../commonAttackLogic'),
    unitLogic: require('../../unitLogic'),
    attackCost: 30,
    accuracy: 0.9,
    displayName: "Strike",
    track: "dualStrike",

    damage:
    {
        archer:
        {
            back: 40,
            side: 35,
            front: 30
        },
        shield:
        {
            back: 35,
            side: 30,
            front: 15,
        },
        warrior:
        {
            back: 40,
            side: 35,
            front: 30
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

    performAttack: function (attackingUnit, targetNode, hitChance)
    {
        var targetUnit = targetNode.tile.unit;

        this.unitLogic.applyCombatLock(attackingUnit, targetUnit);

        var damage = this.commonAttackLogic.applyDamage(attackingUnit, targetUnit, this.accuracy, attackingUnit.direction, this.damage, hitChance);

        return [
            {
                unit: targetUnit,
                damage: damage
            }];
    }
};
