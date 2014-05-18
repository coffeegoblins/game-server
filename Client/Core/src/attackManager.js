define(function ()
{
    'use strict';

    function getOcclusionPercentage(tileNode, quads)
    {
        var samplePoints = [
            {x: tileNode.x + 0.5, y: tileNode.y + 0.5},
            {x: tileNode.x + 0.25, y: tileNode.y + 0.25},
            {x: tileNode.x + 0.75, y: tileNode.y + 0.25},
            {x: tileNode.x + 0.25, y: tileNode.y + 0.75},
            {x: tileNode.x + 0.75, y: tileNode.y + 0.75}
        ];

        var occlusionPercentage = 0;
        var tileUnit = tileNode.tile.unit;

        for (var i = 0; i < samplePoints.length; i++)
        {
            var point = samplePoints[i];
            for (var j = 0; j < quads.length; j++)
            {
                var quad = quads[j];
                if (tileUnit && tileUnit === quad.source.unit)
                    continue;

                if (isPointInConvexPolygon(point.x, point.y, quad.vertices))
                {
                    occlusionPercentage += 0.2;
                    break;
                }
            }
        }

        return occlusionPercentage;
    }

    function getOcclusionQuads(tileNodes, unit, attack)
    {
        if (!attack.isObstructable)
            return;

        var obstacles = [];
        var occlusionQuads = [];

        // Find obstacles
        for (var i = 0; i < tileNodes.length; i++)
        {
            var tile = tileNodes[i].tile;
            if (tile.unit || (tile.content && tile.content.isBlocking !== false))
                obstacles.push(tileNodes[i]);
        }

        // Form occlusion quads
        var attackCenter = {x: unit.tileX + 0.5, y: unit.tileY + 0.5};
        for (i = 0; i < obstacles.length; i++)
        {
            var obstacle = obstacles[i];
            var obstacleCenter = {x: obstacle.x + 0.5, y: obstacle.y + 0.5};

            // Get the normalized direction of the attack
            var direction = {x: obstacleCenter.x - attackCenter.x, y: obstacleCenter.y - attackCenter.y};
            var distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            direction.x /= distance;
            direction.y /= distance;

            // Form the front of the quad using the perpendicular of the attack direction
            var vertex1 = {x: obstacleCenter.x + direction.y * 0.5, y: obstacleCenter.y - direction.x * 0.5};
            var vertex2 = {x: obstacleCenter.x - direction.y * 0.5, y: obstacleCenter.y + direction.x * 0.5};

            // Form the back of the quad by projecting the front from the attack center outward
            var toVertex1 = {x: (vertex1.x - attackCenter.x) / distance, y: (vertex1.y - attackCenter.y) / distance};
            var toVertex2 = {x: (vertex2.x - attackCenter.x) / distance, y: (vertex2.y - attackCenter.y) / distance};

            var vertex3 = {x: vertex2.x + toVertex2.x * attack.range, y: vertex2.y + toVertex2.y * attack.range};
            var vertex4 = {x: vertex1.x + toVertex1.x * attack.range, y: vertex1.y + toVertex1.y * attack.range};

            occlusionQuads.push({source: obstacle.tile, vertices: [vertex2, vertex1, vertex4, vertex3]});
        }

        return occlusionQuads;
    }

    function getTileDistance(x1, y1, x2, y2)
    {
        var deltaX = Math.abs(x2 - x1);
        var deltaY = Math.abs(y2 - y1);

        if (deltaX > deltaY)
            return (deltaX - deltaY) + deltaY * Math.SQRT2;

        return (deltaY - deltaX) + deltaX * Math.SQRT2;
    }

    function getTileNodes(map, unit, range)
    {
        var startX = Math.max(0, Math.floor(unit.tileX - range));
        var startY = Math.max(0, Math.floor(unit.tileY - range));
        var endX = Math.min(map.width - 1, Math.ceil(unit.tileX + range));
        var endY = Math.min(map.height - 1, Math.ceil(unit.tileY + range));

        var tileNodes = [];
        for (var x = startX; x <= endX; x++)
        {
            for (var y = startY; y <= endY; y++)
            {
                if (x === unit.tileX && y === unit.tileY)
                    continue;

                var distance = getTileDistance(unit.tileX, unit.tileY, x, y);
                if (distance <= range)
                    tileNodes.push({x: x, y: y, distance: distance, tile: map.getTile(x, y)});
            }
        }

        return tileNodes;
    }

    function isPointInConvexPolygon(x, y, vertices)
    {
        for (var i = 0; i < vertices.length; i++)
        {
            var vertex = vertices[i];
            var nextVertex = vertices[i + 1] || vertices[0];

            var inwardNormalX = vertex.y - nextVertex.y;
            var inwardNormalY = -(vertex.x - nextVertex.x);

            var midpointToPointX = x - ((vertex.x + nextVertex.x) / 2);
            var midpointToPointY = y - ((vertex.y + nextVertex.y) / 2);

            // The angle between the inward facing edge normal and a vector from the edge midpoint to the given point
            // has to be less than 90 degrees (dot product > 0) an all edges for a point to be inside a convex polygon
            if ((inwardNormalX * midpointToPointX + inwardNormalY * midpointToPointY) < 0)
                return false;
        }

        return true;
    }

    function occludeTiles(quads, tileNodes)
    {
        if (!quads || !quads.length)
            return;

        for (var i = tileNodes.length - 1; i >= 0; i--)
        {
            var tileNode = tileNodes[i];
            var occlusionPercentage = getOcclusionPercentage(tileNode, quads);

            if (occlusionPercentage > 0.9)
                tileNodes.splice(i, 1);
            else if (occlusionPercentage)
                tileNode.occlusionPercentage = occlusionPercentage;
        }
    }


    return {
        applyCombatLock: function (unit, targetTile)
        {
            var deltaX = targetTile.x - unit.tileX;
            var deltaY = targetTile.y - unit.tileY;
            unit.setDirection(deltaX, deltaY);

            var targetUnit = targetTile.tile.unit;
            if (targetUnit && !targetUnit.target)
            {
                targetUnit.setDirection(-deltaX, -deltaY);
                if (Math.abs(deltaX) + Math.abs(deltaY) === 1)
                {
                    unit.target = targetUnit;
                    targetUnit.target = unit;
                }
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

        calculateDamage: function (unit, attack, nodes)
        {
            var targets = [];
            for (var i = 0; i < nodes.length; i++)
            {
                var affectedUnit = nodes[i].tile.unit;
                if (affectedUnit)
                {
                    var damage;
                    var unitType = affectedUnit.type;
                    var accuracy = attack.accuracy[unitType] || attack.accuracy;

                    if (nodes.occlusionPercentage)
                        accuracy *= (1 - nodes.occlusionPercentage);

                    if (Math.random() < accuracy)
                        damage = attack.damage[unitType] || attack.damage;

                    var deltaX = affectedUnit.tileX - unit.tileX;
                    var deltaY = affectedUnit.tileY - unit.tileY;

                    var attackDirection = Math.atan2(deltaX, deltaY);
                    var targetDirection = Math.atan2(affectedUnit.worldDirection.x, affectedUnit.worldDirection.y);

                    var directionDelta = Math.abs(Math.abs(attackDirection - targetDirection) - Math.PI);
                    if (directionDelta > Math.PI * 0.66)
                    { // The attack was from behind
                        damage *= attack.backDamage || 2;
                    }
                    else if (directionDelta > Math.PI * 0.33)
                    { // The attack was from the side
                        damage *= attack.sideDamage || 1.5;
                    }

                    targets.push({unit: affectedUnit, damage: damage});
                }
            }

            return targets;
        },

        calculateTiles: function (map, unit, attack)
        {
            var tileNodes = getTileNodes(map, unit, attack.range);
            var occlusionQuads = getOcclusionQuads(tileNodes, unit, attack);

            // Remove any non-attackable tiles
            var minRange = attack.minRange;
            var verticalRange = attack.verticalRange || 4;
            var unitHeight = map.getTile(unit.tileX, unit.tileY).height;

            for (var i = tileNodes.length - 1; i >= 0; i--)
            {
                var tileNode = tileNodes[i];
                var tile = tileNode.tile;

                // Remove tiles that contain team mates, blocking objects, or are at incompatible ranges
                if ((tile.unit && tile.unit.player === unit.player) ||
                    (tile.content && tile.content.isBlocking !== false) ||
                    (minRange && tileNode.distance < minRange) ||
                    (Math.abs(tile.height - unitHeight) > verticalRange))
                {
                    tileNodes.splice(i, 1);
                }
            }

            occludeTiles(occlusionQuads, tileNodes);
            return tileNodes;
        }
    };
});