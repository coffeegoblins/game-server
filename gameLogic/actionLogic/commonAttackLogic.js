module.exports = {
    unitLogic: require('../unitLogic'),
    utilityLogic: require('../utilityLogic'),
    combatLockCost: 10,

    getTileDistance: function (x1, y1, x2, y2)
    {
        var deltaX = Math.abs(x2 - x1);
        var deltaY = Math.abs(y2 - y1);

        if (deltaX > deltaY)
        {
            return (deltaX - deltaY) + deltaY * Math.SQRT2;
        }

        return (deltaY - deltaX) + deltaX * Math.SQRT2;
    },

    getAttackNodes: function (map, unit, minRange, maxRange)
    {
        // Ensure not null
        minRange = minRange || 0;
        maxRange = maxRange || 1.5;

        var startX = Math.max(0, Math.floor(unit.x - maxRange));
        var startY = Math.max(0, Math.floor(unit.y - maxRange));
        var endX = Math.min(map.width - 1, Math.ceil(unit.x + maxRange));
        var endY = Math.min(map.height - 1, Math.ceil(unit.y + maxRange));

        var tileNodes = [];
        for (var x = startX; x <= endX; x++)
        {
            for (var y = startY; y <= endY; y++)
            {
                if (x === unit.x && y === unit.y)
                {
                    continue;
                }

                var distance = this.getTileDistance(unit.x, unit.y, x, y);
                if (distance <= maxRange && distance >= minRange)
                {
                    var tile = map.getTile(x, y);

                    // Remove tiles that contain team mates, blocking objects
                    if (tile && (!tile.unit || tile.unit.username !== unit.username) &&
                        (!tile.content || !tile.content.isBlocking))
                    {
                        tileNodes.push(
                        {
                            x: x,
                            y: y,
                            distance: distance,
                            tile: tile
                        });
                    }
                }
            }
        }

        return tileNodes;
    },

    getAttackCost: function (unit, targetNode, baseCost)
    {
        if (unit.target && unit.target === targetNode.tile.unit._id)
        {
            return this.combatLockCost + baseCost;
        }

        return baseCost;
    },

    getSingleTargetNode: function (tile)
    {
        // No splash damage
        return [tile];
    },

    hasTarget: function (nodes)
    {
        for (var i = 0; i < nodes.length; ++i)
        {
            if (nodes[i].tile.unit)
            {
                return true;
            }
        }

        return false;
    },

    applyDamage: function (sourceUnit, targetUnit, accuracy, direction, damage, hitChance)
    {
        var damageType = damage[targetUnit.type.toLowerCase()];
        var damageAmount = damageType.front;

        if (hitChance <= accuracy)
        {
            var attackDirection = Math.atan2(direction.x, direction.y);
            var targetDirection = Math.atan2(targetUnit.direction.x, targetUnit.direction.y);

            var directionDelta = Math.abs(Math.abs(attackDirection - targetDirection) - Math.PI);
            if (directionDelta > Math.PI * 0.66)
            {
                // The attack was from behind
                damageAmount = damageType.back;
            }
            else if (directionDelta > Math.PI * 0.33)
            {
                // The attack was from the side
                damageAmount = damageType.side;
            }

            targetUnit.hp -= damageAmount;
            if (targetUnit.hp <= 0)
            {
                this.unitLogic.breakCombatLock(sourceUnit, targetUnit);
            }
        }

        return damageAmount;
    }
};
