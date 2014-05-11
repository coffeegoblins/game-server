define(function ()
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

    // This is used to optimize Dijkstra's algorithm
    function DualKeyHash()
    {
        this.hash = {};
    }

    DualKeyHash.prototype.add = function (key1, key2, obj)
    {
        if (!this.hash[key1])
            this.hash[key1] = {};

        this.hash[key1][key2] = obj;
    };

    DualKeyHash.prototype.remove = function (key1, key2)
    {
        if (this.hash[key1])
            delete this.hash[key1][key2];
    };

    DualKeyHash.prototype.get = function (key1, key2)
    {
        return this.hash[key1] && this.hash[key1][key2];
    };

    DualKeyHash.prototype.toArray = function ()
    {
        var items = [];
        for (var key1 in this.hash)
        {
            for (var key2 in this.hash[key1])
            {
                items.push(this.hash[key1][key2]);
            }
        }

        return items;
    };


    function PathManager()
    {
    }

    PathManager.canMoveToDiagonal = function (map, currentNode, directionX, directionY, options)
    {
        return PathManager.canMoveToTile(map, currentNode, directionX, directionY, options) &&
               PathManager.canMoveToTile(map, currentNode, directionX, 0, options) &&
               PathManager.canMoveToTile(map, currentNode, 0, directionY, options);
    };

    PathManager.canMoveToTile = function (map, currentNode, directionX, directionY, options)
    {
        var destinationTile = map.getTile(currentNode.x + directionX, currentNode.y + directionY);
        if (!destinationTile || destinationTile.unit)
            return false;

        // TODO: Make this more robust
        if (destinationTile.spriteIndex > 16 && destinationTile.spriteIndex <= 32)
            return false;

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


    PathManager.calculateAvailableTiles = function (map, options)
    {
        var currentNodes = new DualKeyHash();
        var completedNodes = new DualKeyHash();

        var currentNode = {distance: 0, x: options.x, y: options.y, tile: map.getTile(options.x, options.y), neighbors: []};
        currentNodes.add(currentNode.x, currentNode.y, currentNode);
        var processingNodes = [currentNode];

        while (true)
        {
            // Make sure we don't pass the unit's movable boundary
            currentNode = processingNodes.shift();
            if (currentNode == null || !isFinite(currentNode.distance) || currentNode.distance > options.maxDistance)
                break;

            completedNodes.add(currentNode.x, currentNode.y, currentNode);

            // Check for potential nodes in all directions
            for (var i = 0; i < directions.length; i++)
            {
                var xDirection = directions[i][0];
                var yDirection = directions[i][1];

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
                    if (!PathManager.canMoveToDiagonal(map, currentNode, xDirection, yDirection, options))
                        continue;
                }
                else if (!PathManager.canMoveToTile(map, currentNode, xDirection, yDirection, options))
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

                if (Math.abs(heightDifference) <= options.maxClimbableHeight)
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
        completedNodes.remove(options.x, options.y);
        return completedNodes.toArray();
    };

    PathManager.calculatePathFromNodes = function (node, x, y)
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
    };

    return PathManager;
});
