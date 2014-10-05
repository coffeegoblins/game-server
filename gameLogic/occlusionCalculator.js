module.exports = {
    getOcclusionPercentage: function (tileNode, quads)
    {
        var samplePoints = [
            {
                x: tileNode.x + 0.5,
                y: tileNode.y + 0.5
            },
            {
                x: tileNode.x + 0.25,
                y: tileNode.y + 0.25
            },
            {
                x: tileNode.x + 0.75,
                y: tileNode.y + 0.25
            },
            {
                x: tileNode.x + 0.25,
                y: tileNode.y + 0.75
            },
            {
                x: tileNode.x + 0.75,
                y: tileNode.y + 0.75
            }
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
                {
                    continue;
                }

                if (this.isPointInConvexPolygon(point.x, point.y, quad.vertices))
                {
                    occlusionPercentage += 0.2;
                    break;
                }
            }
        }

        return occlusionPercentage;
    },

    getOcclusionQuads: function (tileNodes, unit, range)
    {
        var obstacles = [];
        var occlusionQuads = [];

        // Find obstacles
        for (var i = 0; i < tileNodes.length; i++)
        {
            var tile = tileNodes[i].tile;
            if (tile.unit || (tile.content && tile.content.isBlocking !== false))
            {
                obstacles.push(tileNodes[i]);
            }
        }

        // Form occlusion quads
        var attackCenter = {
            x: unit.x + 0.5,
            y: unit.y + 0.5
        };

        for (i = 0; i < obstacles.length; i++)
        {
            var obstacle = obstacles[i];
            var obstacleCenter = {
                x: obstacle.x + 0.5,
                y: obstacle.y + 0.5
            };

            // Get the normalized direction of the attack
            var direction = {
                x: obstacleCenter.x - attackCenter.x,
                y: obstacleCenter.y - attackCenter.y
            };
            var distance = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
            direction.x /= distance;
            direction.y /= distance;

            // Form the front of the quad using the perpendicular of the attack direction
            var vertex1 = {
                x: obstacleCenter.x + direction.y * 0.5,
                y: obstacleCenter.y - direction.x * 0.5
            };
            var vertex2 = {
                x: obstacleCenter.x - direction.y * 0.5,
                y: obstacleCenter.y + direction.x * 0.5
            };

            // Form the back of the quad by projecting the front from the attack center outward
            var toVertex1 = {
                x: (vertex1.x - attackCenter.x) / distance,
                y: (vertex1.y - attackCenter.y) / distance
            };
            var toVertex2 = {
                x: (vertex2.x - attackCenter.x) / distance,
                y: (vertex2.y - attackCenter.y) / distance
            };

            var vertex3 = {
                x: vertex2.x + toVertex2.x * range,
                y: vertex2.y + toVertex2.y * range
            };
            var vertex4 = {
                x: vertex1.x + toVertex1.x * range,
                y: vertex1.y + toVertex1.y * range
            };

            occlusionQuads.push(
            {
                source: obstacle.tile,
                vertices: [vertex2, vertex1, vertex4, vertex3]
            });
        }

        return occlusionQuads;
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
            {
                return false;
            }
        }

        return true;
    },

    occludeTiles: function (quads, tileNodes)
    {
        for (var i = tileNodes.length - 1; i >= 0; i--)
        {
            var tileNode = tileNodes[i];

            tileNode.occlusionPercentage = this.getOcclusionPercentage(tileNode, quads);
            if (tileNode.occlusionPercentage > 0.9)
            {
                tileNodes.splice(i, 1);
            }
        }
    },

    getOcclusionAccuracy: function (baseAccuracy, targetNode)
    {
        return baseAccuracy *= (1 - targetNode.occlusionPercentage);
    },
};
