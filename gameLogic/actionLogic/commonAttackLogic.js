module.exports = {
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

        var startX = Math.max(0, Math.floor(unit.tileX - maxRange));
        var startY = Math.max(0, Math.floor(unit.tileY - maxRange));
        var endX = Math.min(map.width - 1, Math.ceil(unit.tileX + maxRange));
        var endY = Math.min(map.height - 1, Math.ceil(unit.tileY + maxRange));

        var tileNodes = [];
        for (var x = startX; x <= endX; x++)
        {
            for (var y = startY; y <= endY; y++)
            {
                if (x === unit.tileX && y === unit.tileY)
                {
                    continue;
                }

                var distance = this.getTileDistance(unit.tileX, unit.tileY, x, y);
                if (distance <= maxRange && distance >= minRange)
                {
                    var tile = map.getTile(x, y);

                    // Remove tiles that contain team mates, blocking objects
                    if ((!tile.unit || tile.unit.username !== unit.username) &&
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

    getAttackCost: function (unit, targetTile)
    {
        if (unit.target && targetTile && unit.target !== targetTile.unit)
        {
            return this.combatLockCost;
        }

        return 0;
    },

    getSingleTargetNode: function (tile)
    {
        // No splash damage
        return [tile];
    },

    hasTarget: function (tiles)
    {
        for (var i = 0; i < tiles.length; ++i)
        {
            var tile = tiles[i];
            if (tile.unit)
            {
                return true;
            }
        }

        return false;
    },
};