module.exports = {
    commonAttackLogic: require('../commonAttackLogic'),
    unitLogic: require('../../unitLogic'),
    attackCost: 30,
    accuracy: 0.9,
    displayName: "Shield Bash",
    track: "shieldBash1",

    damage:
    {
        archer:
        {
            back: 20,
            side: 20,
            front: 15
        },
        shield:
        {
            back: 20,
            side: 20,
            front: 5,
        },
        warrior:
        {
            back: 20,
            side: 20,
            front: 10
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
