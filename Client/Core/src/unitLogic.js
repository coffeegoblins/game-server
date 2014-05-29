define(['text!../content/soldierData.json', './utility'], function (SoldierData, Utility)
{
    'use strict';

    var tileDirections = [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];

    // This is used to optimize Dijkstra's algorithm
    function DualKeyHash()
    {
        this.hash = {};

        this.add = function (key1, key2, obj)
        {
            if (!this.hash[key1])
                this.hash[key1] = {};

            this.hash[key1][key2] = obj;
        };

        this.get = function (key1, key2)
        {
            return this.hash[key1] && this.hash[key1][key2];
        };

        this.remove = function (key1, key2)
        {
            if (this.hash[key1])
                delete this.hash[key1][key2];
        };

        this.toArray = function ()
        {
            var items = [];
            for (var key1 in this.hash)
            {
                for (var key2 in this.hash[key1])
                    items.push(this.hash[key1][key2]);
            }

            return items;
        };
    }

    // This is used to calculate occlusion for ranged attacks
    var OcclusionCalculator = {
        getOcclusionPercentage: function (tileNode, quads)
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

                    if (this.isPointInConvexPolygon(point.x, point.y, quad.vertices))
                    {
                        occlusionPercentage += 0.2;
                        break;
                    }
                }
            }

            return occlusionPercentage;
        },

        getOcclusionQuads: function (tileNodes, unit, attack)
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
        },

        getTileDistance: function (x1, y1, x2, y2)
        {
            var deltaX = Math.abs(x2 - x1);
            var deltaY = Math.abs(y2 - y1);

            if (deltaX > deltaY)
                return (deltaX - deltaY) + deltaY * Math.SQRT2;

            return (deltaY - deltaX) + deltaX * Math.SQRT2;
        },

        getTileNodes: function (map, unit, range)
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

                    var distance = this.getTileDistance(unit.tileX, unit.tileY, x, y);
                    if (distance <= range)
                        tileNodes.push({x: x, y: y, distance: distance, tile: map.getTile(x, y)});
                }
            }

            return tileNodes;
        },

        isPointInConvexPolygon: function (x, y, vertices)
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
        },

        occludeTiles: function (quads, tileNodes)
        {
            if (!quads || !quads.length)
                return;

            for (var i = tileNodes.length - 1; i >= 0; i--)
            {
                var tileNode = tileNodes[i];
                var occlusionPercentage = this.getOcclusionPercentage(tileNode, quads);

                if (occlusionPercentage > 0.9)
                    tileNodes.splice(i, 1);
                else if (occlusionPercentage)
                    tileNode.occlusionPercentage = occlusionPercentage;
            }
        }
    };


    return Object.freeze({
        combatLockCost: 10,
        soldierData: JSON.parse(SoldierData),
        tileDirections: tileDirections,
        version: 0.1,

        DualKeyHash: DualKeyHash,
        OcclusionCalculator: OcclusionCalculator,
        merge: Utility.merge,


        // Soldier data accessors
        getAttack: function (unit, name)
        {
            var attack = this.merge({name: name, range: 1}, this.soldierData[unit.type].attacks[name]);
            attack.isDisabled = (attack.cost > unit.ap);
            return attack;
        },

        getAttacks: function (unit)
        {
            // TODO: Change this to an array in solider data to ensure order?
            var attackNames = Object.keys(this.soldierData[unit.type].attacks);
            return attackNames.map(function (attackName)
            {
                return this.getAttack(unit, attackName);
            }, this);
        },

        getAttackCost: function (unit, attack, targetTile)
        {
            var cost = attack.cost;
            if (unit.target && targetTile && unit.target !== targetTile.unit)
                cost += this.combatLockCost;

            return cost;
        },

        getMoveCost: function (unit, distance)
        {
            var cost = distance * this.soldierData[unit.type].moveCost;
            if (unit.target)
                cost += this.combatLockCost;

            return cost;
        },


        // Attacking logic
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

        getAttackTiles: function (map, unit, attack)
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
                if ((tile.unit && tile.unit.player === unit.player) ||
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
                    }

                    targets.push({unit: targetUnit, damage: damage});
                }
            }

            return targets;
        },


        // Moving logic
        beginMoveUnit: function (map, unit, tileNode)
        {
            this.breakCombatLock(unit);
            map.getTile(unit.tileX, unit.tileY).unit = null;
            return this.getMoveCost(unit, tileNode.distance);
        },

        endMoveUnit: function (unit, tileNode, cost)
        {
            unit.ap -= cost;
            unit.tileX = tileNode.x;
            unit.tileY = tileNode.y;
            tileNode.tile.unit = unit;
        },

        moveUnit: function (map, unit, tileNode)
        {
            this.endMoveUnit(unit, tileNode, this.beginMoveUnit(map, unit, tileNode));
        },

        // Pathing logic
        calculatePathFromNodes: function (node, x, y)
        {
            var pathNodes = [];
            while (node && (node.x !== x || node.y !== y))
            {
                pathNodes.unshift(node);

                var lowestIndex = 0;
                for (var i = 0; i < node.neighbors.length; ++i)
                {
                    if (node.neighbors[i].distance < node.neighbors[lowestIndex].distance)
                        lowestIndex = i;
                }

                node = node.neighbors[lowestIndex];
            }

            return pathNodes;
        },

        canMoveToDiagonal: function (map, unit, currentNode, directionX, directionY)
        {
            return this.canMoveToTile(map, unit, currentNode, directionX, directionY) &&
                   this.canMoveToTile(map, unit, currentNode, directionX, 0) &&
                   this.canMoveToTile(map, unit, currentNode, 0, directionY);
        },

        canMoveToTile: function (map, unit, currentNode, directionX, directionY)
        {
            var destinationTile = map.getTile(currentNode.x + directionX, currentNode.y + directionY);
            if (!destinationTile || destinationTile.unit)
                return false;

            // TODO: Associate this with the map spritesheet. This range of tiles are can't be moved to.
            if (destinationTile.spriteIndex > 16 && destinationTile.spriteIndex <= 32)
                return false;

            var sourceIsClimbable, destinationIsClimbable;
            if (unit.canClimbObjects && (directionX === 0 || directionY === 0))
            { // TODO: Are climbable objects still a thing?
                sourceIsClimbable = (currentNode.tile.content && currentNode.tile.content.isClimbable);
                destinationIsClimbable = (destinationTile.content && destinationTile.content.isClimbable);
            }

            // Don't allow traversal over world objects
            if (destinationTile.content && !destinationIsClimbable)
                return false;

            // Don't allow traversal over nodes with an unclimbable height gap
            if (Math.abs(currentNode.tile.height - destinationTile.height) > unit.maxClimbableHeight && !sourceIsClimbable && !destinationIsClimbable)
                return false;

            return true;
        },

        getMoveTiles: function (map, unit)
        {
            var currentNodes = new this.DualKeyHash();
            var completedNodes = new this.DualKeyHash();

            var maxDistance = unit.ap / this.soldierData[unit.type].moveCost;
            var currentNode = {
                distance: 0,
                x: unit.tileX,
                y: unit.tileY,
                neighbors: [],
                tile: map.getTile(unit.tileX, unit.tileY)
            };

            currentNodes.add(currentNode.x, currentNode.y, currentNode);
            var processingNodes = [currentNode];

            while (true)
            {
                // Make sure we don't pass the unit's movable boundary
                currentNode = processingNodes.shift();
                if (currentNode == null || !isFinite(currentNode.distance) || currentNode.distance > maxDistance)
                    break;

                completedNodes.add(currentNode.x, currentNode.y, currentNode);

                // Check for potential nodes in all directions
                for (var i = 0; i < this.tileDirections.length; i++)
                {
                    var xDirection = this.tileDirections[i][0];
                    var yDirection = this.tileDirections[i][1];

                    var x = currentNode.x + xDirection;
                    var y = currentNode.y + yDirection;

                    // Make sure this node is valid hasn't already been checked
                    if (completedNodes.get(x, y))
                        continue;

                    var tile = map.getTile(x, y);
                    if (!tile)
                        continue;

                    // See if the we can access the new tile
                    var isDiagonal = (xDirection !== 0 && yDirection !== 0);
                    if (isDiagonal)
                    {
                        if (!this.canMoveToDiagonal(map, unit, currentNode, xDirection, yDirection))
                            continue;
                    }
                    else if (!this.canMoveToTile(map, unit, currentNode, xDirection, yDirection))
                    {
                        continue;
                    }

                    // Create the new node, or find it if it already exists
                    var newNode = currentNodes.get(x, y);
                    if (!newNode)
                    {
                        newNode = {distance: Infinity, x: x, y: y, tile: tile, neighbors: [currentNode]};
                        currentNodes.add(x, y, newNode);
                    }

                    var heightDifference = tile.height - currentNode.tile.height;
                    var distance = currentNode.distance + (isDiagonal ? Math.SQRT2 : 1);

                    // TODO: What's going on with heights? Are they out of the picture now?
                    if (Math.abs(heightDifference) <= unit.maxClimbableHeight)
                        distance += heightDifference / 10;

                    if (distance < newNode.distance)
                        newNode.distance = distance;

                    currentNode.neighbors.push(newNode);

                    // Insert the node into the sorted array
                    var index = processingNodes.indexOf(newNode);
                    if (index >= 0)
                        processingNodes.splice(index, 1);

                    for (var j = 0; j < processingNodes.length; j++)
                    {
                        var node = processingNodes[j];
                        if (node.distance > newNode.distance)
                            break;
                    }

                    processingNodes.splice(j, 0, newNode);
                }
            }

            // Remove the initial tile and flatten this out to an array
            completedNodes.remove(unit.tileX, unit.tileY);
            return completedNodes.toArray();
        }
    });
});