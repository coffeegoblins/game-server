module.exports = {
    OcclusionCalculator: require('./occlusionCalculator'),

    breakCombatLock: function (unit)
    {
        if (unit.target)
        {
            unit.target.target = null;
            unit.target = null;
        }
    },

    calculateCrossNodes: function (unit, selectedNode, availableNodes)
    {
        var crossNodes = [];
        var x = selectedNode.x;
        var y = selectedNode.y;

        for (var i = 0; i < availableNodes.length; ++i)
        {
            var node = availableNodes[i];
            if (node.tile.unit !== unit &&
                (node.x === x && Math.abs(node.y - y) === 1) ||
                (node.y === y && Math.abs(node.x - x) === 1))
            {
                crossNodes.push(node);
            }
        }

        return crossNodes;
    },

    getAttackNodes: function (map, unit, attack)
    {
        var tileNodes = this.OcclusionCalculator.getTileNodes(map, unit, attack.range);
        var occlusionQuads = this.OcclusionCalculator.getOcclusionQuads(tileNodes, unit, attack);

        // Remove any non-attackable tiles
        var minRange = attack.minRange;
        var verticalRange = attack.verticalRange || 4; // TODO: Is height stuff still needed?
        var unitHeight = map.getTile(unit.tileX, unit.tileY).height;

        for (var i = tileNodes.length - 1; i >= 0; i--)
        {
            var tileNode = tileNodes[i];
            var tile = tileNode.tile;

            // Remove tiles that contain team mates, blocking objects, or are at incompatible ranges
            if ((tile.unit && tile.unit.username === unit.username) ||
                (tile.content && tile.content.isBlocking !== false) ||
                (minRange && tileNode.distance < minRange) ||
                (Math.abs(tile.height - unitHeight) > verticalRange))
            {
                tileNodes.splice(i, 1);
            }
        }

        this.OcclusionCalculator.occludeTiles(occlusionQuads, tileNodes);
        return tileNodes;
    },

    performAttack: function (unit, attack, targetTile, affectedTiles)
    {
        this.breakCombatLock(unit);
        unit.ap -= this.getAttackCost(unit, attack, targetTile);

        var deltaX = targetTile.x - unit.tileX;
        var deltaY = targetTile.y - unit.tileY;
        unit.setDirection(deltaX, deltaY);

        var targets = [];
        for (var i = 0; i < affectedTiles.length; i++)
        {
            var tileNode = affectedTiles[i];
            var targetUnit = tileNode.tile.unit;
            if (targetUnit)
            {
                deltaX = targetUnit.tileX - unit.tileX;
                deltaY = targetUnit.tileY - unit.tileY;

                // Apply combat lock
                if (!targetUnit.target)
                {
                    targetUnit.setDirection(-deltaX, -deltaY);

                    // Don't lock units attacked from a distance
                    if (Math.abs(deltaX) + Math.abs(deltaY) === 1)
                    {
                        unit.target = targetUnit;
                        targetUnit.target = unit;
                    }
                }

                var damage;
                var unitType = targetUnit.type;
                var accuracy = attack.accuracy[unitType] || attack.accuracy;

                if (tileNode.occlusionPercentage)
                    accuracy *= (1 - tileNode.occlusionPercentage);

                if (Math.random() < accuracy)
                {
                    damage = attack.damage[unitType] || attack.damage;
                    var attackDirection = Math.atan2(deltaX, deltaY);
                    var targetDirection = Math.atan2(targetUnit.worldDirection.x, targetUnit.worldDirection.y);

                    var directionDelta = Math.abs(Math.abs(attackDirection - targetDirection) - Math.PI);
                    if (directionDelta > Math.PI * 0.66)
                    { // The attack was from behind
                        damage *= attack.backDamage || 2;
                    }
                    else if (directionDelta > Math.PI * 0.33)
                    { // The attack was from the side
                        damage *= attack.sideDamage || 1.5;
                    }

                    targetUnit.damage(damage);

                    if (attack.breakCombatLock)
                        this.breakCombatLock(targetUnit);
                }

                targets.push(
                {
                    unit: targetUnit,
                    damage: damage
                });
            }
        }

        return targets;
    }
};
