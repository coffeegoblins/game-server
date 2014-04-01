define(['./utility'], function (Utility)
{
    'use strict';

    var directions = [
        [-1, -1],
        [-1, 1],
        [1, 1],
        [1, -1],
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
    ];

    function PathManager()
    {
    }

    PathManager.defaultMoveCost = 10;
    PathManager.diagonalMoveCost = 14;

    PathManager.calculateAvailableTiles = function (map, options)
    {
        var currentNode = {distance: 0, x: options.x, y: options.y, tile: map.getTile(options.x, options.y), neighbors: []};
        var completedNodes = [];
        var processingNodes = [currentNode];

        while (true)
        {
            // Make sure we don't pass the unit's movable boundary
            currentNode = PathManager.getClosestTile(processingNodes);
            if (currentNode == null || !isFinite(currentNode.distance) || currentNode.distance > options.maxDistance)
                break;

            completedNodes.push(currentNode);

            // Check for potential nodes in all directions
            for (var i = 0; i < directions.length; i++)
            {
                var xDirection = directions[i][0];
                var yDirection = directions[i][1];

                var x = currentNode.x + xDirection;
                var y = currentNode.y + yDirection;
                var tile = map.getTile(x, y);

                // Make sure this node is valid hasn't already been checked
                if (!tile || Utility.getElementByProperties(completedNodes, {x: x, y: y}))
                    continue;

                // See if the we can access the new tile
                var isDiagonal = (xDirection !== 0 && yDirection !== 0);
                if (isDiagonal)
                {
                    if (!PathManager.canMoveToDiagonal(map, currentNode, xDirection, yDirection, options))
                        continue;
                }
                else if (!PathManager.canMoveToTile(map, currentNode, xDirection, yDirection, options))
                {
                    continue;
                }

                // Create the new node, or find it if it already exists
                var newNode = Utility.getElementByProperties(processingNodes, {x: x, y: y});
                if (!newNode)
                {
                    newNode = {distance: Infinity, x: x, y: y, tile: tile, neighbors: [currentNode]};
                    processingNodes.push(newNode);
                }

                var heightDifference = tile.height - currentNode.tile.height;
                var distance = currentNode.distance + (isDiagonal ? PathManager.diagonalMoveCost : PathManager.defaultMoveCost);

                if (Math.abs(heightDifference) <= options.maxClimbableHeight)
                    distance += heightDifference;

                if (distance < newNode.distance)
                    newNode.distance = distance;

                currentNode.neighbors.push(newNode);
            }
        }

        // Remove the initial tile
        completedNodes.shift();

        return completedNodes;
    };

    PathManager.calculatePathFromNodes = function (node, x, y)
    {
        var pathNodes = [];
        while (node && (node.x !== x || node.y !== y))
        {
            pathNodes.unshift(node);
            node = PathManager.findClosestNeighbor(node);
        }

        return pathNodes;
    };

    PathManager.canMoveToDiagonal = function (map, currentNode, directionX, directionY, options)
    {
        return PathManager.canMoveToTile(map, currentNode, directionX, directionY, options) &&
               PathManager.canMoveToTile(map, currentNode, directionX, 0, options) &&
               PathManager.canMoveToTile(map, currentNode, 0, directionY, options);
    };

    PathManager.canMoveToTile = function (map, currentNode, directionX, directionY, options)
    {
        var destinationTile = map.getTile(currentNode.x + directionX, currentNode.y + directionY);
        if (!destinationTile)
            return false;

        // TODO: Make this more robust
        if (destinationTile.spriteIndex > 16 && destinationTile.spriteIndex <= 32)
            return false;

        if (destinationTile.unit)
        {
            if (!options.ignoreUnits)
                return false;

            if (options.excludePlayer && destinationTile.unit.player === options.excludePlayer)
                return false;
        }

        var sourceIsClimbable, destinationIsClimbable;
        if (options.canClimbObjects && (directionX === 0 || directionY === 0))
        {
            sourceIsClimbable = (currentNode.tile.content && currentNode.tile.content.isClimbable);
            destinationIsClimbable = (destinationTile.content && destinationTile.content.isClimbable);
        }

        // Don't allow traversal over world objects
        if (destinationTile.content && !destinationIsClimbable)
            return false;

        // Don't allow traversal over nodes with an unclimbable height gap
        if (Math.abs(currentNode.tile.height - destinationTile.height) > options.maxClimbableHeight && !sourceIsClimbable && !destinationIsClimbable)
            return false;

        return true;
    };

    PathManager.findClosestNeighbor = function (node)
    {
        var lowestIndex = 0;
        for (var i = 0; i < node.neighbors.length; ++i)
        {
            if (node.neighbors[i].distance < node.neighbors[lowestIndex].distance)
                lowestIndex = i;
        }

        return node.neighbors[lowestIndex];
    };

    PathManager.getClosestTile = function (nodes)
    {
        var lowestIndex = 0;
        for (var i = 0; i < nodes.length; ++i)
        {
            if (nodes[i].distance < nodes[lowestIndex].distance)
                lowestIndex = i;
        }

        return nodes.splice(lowestIndex, 1)[0];
    };

    return PathManager;
});
