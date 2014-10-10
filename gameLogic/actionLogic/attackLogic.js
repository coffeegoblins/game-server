module.exports = {
    commonAttackLogic: require('../commonAttackLogic'),
    unitLogic: require('../../unitLogic'),
    attackCost: 40,
    accuracy: 0.9,
    displayName: "Strike",
    track: "dualStrike",

    damage:
    {
        archer:
        {
            back: 30,
            side: 30,
            front: 30
        },
        shield:
        {
            back: 20,
            side: 20,
            front: 20,
        },
        warrior:
        {
            back: 25,
            side: 25,
            front: 25
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
