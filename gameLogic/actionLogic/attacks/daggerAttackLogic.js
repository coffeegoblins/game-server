module.exports = {
    commonAttackLogic: require('../commonAttackLogic'),
    unitLogic: require('../../unitLogic'),
    attackCost: 10,
    track: "bow1",
    displayName: "Stab",
    damage:
    {
        archer:
        {
            back: 20,
            side: 15,
            front: 10
        },
        shield:
        {
            back: 15,
            side: 10,
            front: 5
        },
        warrior:
        {
            back: 20,
            side: 15,
            front: 5
        }
    },
    accuracy: 0.9,

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
