define(function ()
{
    'use strict';

    /**
     * @constructor
     */
    function PathManager()
    {
        this.defaultMoveCost = 10;
        this.diagonalMoveCost = 14;
    }

    PathManager.prototype.calculatePath = function (nodes, x, y, targetX, targetY)
    {
        var currentNode;

        for (var i = 0; i < nodes.length; ++i)
        {
            if (nodes[i].x === targetX && nodes[i].y === targetY)
            {
                currentNode = nodes[i];
                break;
            }
        }

        if (!currentNode)
            return;

        var pathNodes = [];
        while (currentNode.x !== x || currentNode.y !== y)
        {
            pathNodes.unshift(currentNode);
            currentNode = this.findClosestNeighbor(currentNode);
        }

        return pathNodes;
    };

    PathManager.prototype.findClosestNeighbor = function (node)
    {
        var lowestIndex = 0;
        for (var i = 0; i < node.neighbors.length; ++i)
        {
            if (node.neighbors[i].distance < node.neighbors[lowestIndex].distance)
                lowestIndex = i;
        }

        return node.neighbors[lowestIndex];
    };

    PathManager.prototype.calculateAvailableTiles = function (map, x, y, maxDistance, maxClimbableHeight, ignoreUnits)
    {
        var currentNode = { distance: 0, x: x, y: y, tile: map.getTile(x, y), neighbors: [] };

        this.map = map;

        this.completedNodes = [];
        this.processingNodes = [currentNode];

        while (true)
        {
            currentNode = this.getClosestTile(this.processingNodes);
            if (currentNode == null || currentNode.distance === Infinity || currentNode.distance > maxDistance)
            {
                // We're past the boundary that the unit can move
                break;
            }

            this.completedNodes.push(currentNode);

            var diagonalDistance = currentNode.distance + this.diagonalMoveCost;

            if (this.canMoveToDiagonal(currentNode, -1, -1, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, -1, -1, diagonalDistance, maxClimbableHeight);

            if (this.canMoveToDiagonal(currentNode, 1, -1, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, 1, -1, diagonalDistance, maxClimbableHeight);

            if (this.canMoveToDiagonal(currentNode, -1, 1, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, -1, 1, diagonalDistance, maxClimbableHeight);

            if (this.canMoveToDiagonal(currentNode, 1, 1, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, 1, 1, diagonalDistance, maxClimbableHeight);

            var straightDistance = currentNode.distance + this.defaultMoveCost;

            if (this.canMoveToTile(currentNode, 0, -1, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, 0, -1, straightDistance, maxClimbableHeight);

            if (this.canMoveToTile(currentNode, 0, 1, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, 0, 1, straightDistance, maxClimbableHeight);

            if (this.canMoveToTile(currentNode, -1, 0, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, -1, 0, straightDistance, maxClimbableHeight);

            if (this.canMoveToTile(currentNode, 1, 0, maxClimbableHeight, ignoreUnits))
                this.evaluateNeighbor(currentNode, 1, 0, straightDistance, maxClimbableHeight);
        }

        this.map = null;

        return this.completedNodes;
    };

    PathManager.prototype.canMoveToDiagonal = function (currentNode, directionX, directionY, maxClimbableHeight, ignoreUnits)
    {
        return this.canMoveToTile(currentNode, directionX, directionY, maxClimbableHeight, ignoreUnits) &&
               this.canMoveToTile(currentNode, directionX, 0, maxClimbableHeight, ignoreUnits) &&
               this.canMoveToTile(currentNode, 0, directionY, maxClimbableHeight, ignoreUnits);
    };

    PathManager.prototype.canMoveToTile = function (currentNode, directionX, directionY, maxClimbableHeight, ignoreUnits)
    {
        // Don't allow traversal over other units
        var destinationTile = this.map.getTile(currentNode.x + directionX, currentNode.y + directionY);
        if (!destinationTile || (destinationTile.unit != null && !ignoreUnits))
            return false;

        var sourceIsClimbable, destinationIsClimbable;
        if (maxClimbableHeight > 0 && (directionX === 0 || directionY === 0))
        {
            sourceIsClimbable = (currentNode.tile.content && currentNode.tile.content.isClimbable);
            destinationIsClimbable = (destinationTile.content && destinationTile.content.isClimbable);
        }

        // Don't allow traversal over world objects
        if (destinationTile.content && !destinationIsClimbable)
            return false;

        // Don't allow traversal over nodes with an unclimbable height gap
        if (Math.abs(currentNode.tile.height - destinationTile.height) > maxClimbableHeight && !sourceIsClimbable && !destinationIsClimbable)
            return false;

        return true;
    };

    PathManager.prototype.getClosestTile = function (nodes)
    {
        var lowestIndex = 0;
        for (var i = 0; i < nodes.length; ++i)
        {
            if (nodes[i].distance < nodes[lowestIndex].distance)
                lowestIndex = i;
        }

        return nodes.splice(lowestIndex, 1)[0];
    };

    PathManager.prototype.evaluateNeighbor = function (currentNode, directionX, directionY, additionalDistance, maxClimbableHeight)
    {
        var x = currentNode.x + directionX;
        var y = currentNode.y + directionY;

        var tile = this.map.getTile(x, y);
        if (tile)
        {
            // Make sure this node hasn't already been checked
            for (var i = 0; i < this.completedNodes.length; ++i)
            {
                if (this.completedNodes[i].x === x && this.completedNodes[i].y === y)
                    return;
            }

            var node = null;
            for (i = 0; i < this.processingNodes.length; ++i)
            {
                if (this.processingNodes[i].x === x && this.processingNodes[i].y === y)
                    node = this.processingNodes[i];
            }

            if (!node)
            {
                node = {distance: Infinity, x: x, y: y, tile: tile, neighbors: [currentNode]};
                this.processingNodes.push(node);
            }

            var distance = additionalDistance;
            var heightDifference = tile.height - currentNode.tile.height;
            if (Math.abs(heightDifference) <= maxClimbableHeight)
                distance += heightDifference;

            if (distance < node.distance)
                node.distance = distance;

            currentNode.neighbors.push(node);
        }
    };

    return new PathManager();
});