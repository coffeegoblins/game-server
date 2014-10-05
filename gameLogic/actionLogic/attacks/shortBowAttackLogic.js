module.exports = {
    commonAttackLogic: require('../commonAttackLogic'),
    occlusionCalculator: require('../../occlusionCalculator'),
    unitLogic: require('../../unitLogic'),
    maxRange: 10,
    attackCost: 20,
    minRange: 1.9,
    track: "bow1",
    displayName: "Short Attack",
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
            back: 30,
            side: 25,
            front: 10,
        },
        warrior:
        {
            back: 30,
            side: 30,
            front: 30
        }
    },
    accuracy:
    {
        archer: 0.75,
        shield: 0.9,
        warrior: 0.5
    },

    getAttackNodes: function (map, attackingUnit)
    {
        var tileNodes = this.commonAttackLogic.getAttackNodes(map, attackingUnit, this.minRange, this.maxRange);

        var occlusionQuads = this.occlusionCalculator.getOcclusionQuads(tileNodes, attackingUnit, this.maxRange);
        this.occlusionCalculator.occludeTiles(occlusionQuads, tileNodes);

        return tileNodes;
    },

    getTargetNodes: function (tile)
    {
        return this.commonAttackLogic.getSingleTargetNode(tile);
    },

    performAttack: function (attackingUnit, targetNode)
    {
        var targetUnit = targetNode.tile.unit;
        var accuracy = this.occlusionCalculator.getOcclusionAccuracy(this.accuracy[targetUnit.type], targetNode);

        this.unitLogic.setDirection(attackingUnit, targetUnit);
        var damage = this.commonAttackLogic.applyDamage(targetUnit, accuracy, attackingUnit.direction, this.damage);

        return [
            {
                unit: targetUnit,
                damage: damage
            }];
    }
};
