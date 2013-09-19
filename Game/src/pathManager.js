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

    PathManager.prototype.canMoveToDiagonal = function (currentNode, directionX, directionY)
    {
        return this.canMoveToTile(currentNode, directionX, directionY) &&
               this.canMoveToTile(currentNode, directionX, 0) &&
               this.canMoveToTile(currentNode, 0, directionY);
    };

    PathManager.prototype.canMoveToTile = function (currentNode, directionX, directionY)
    {
        // Don't allow traversal over other units
        var destinationTile = this.map.getTile(currentNode.x + directionX, currentNode.y + directionY);
        if (!destinationTile || destinationTile.unit != null)
            return false;

        var sourceIsClimbable, destinationIsClimbable;
        if (this.unit.canClimbObjects && (directionX === 0 || directionY === 0))
        {
            sourceIsClimbable = (currentNode.tile.content && currentNode.tile.content.isClimbable);
            destinationIsClimbable = (destinationTile.content && destinationTile.content.isClimbable);
        }

        // Don't allow traversal over world objects
        if (destinationTile.content && !destinationIsClimbable)
            return false;


        // Don't allow traversal over nodes with an unclimbable height gap
        if (Math.abs(currentNode.tile.height - destinationTile.height) > this.unit.maxMoveableHeight && !sourceIsClimbable && !destinationIsClimbable)
            return false;

        return true;
    };

    PathManager.prototype.calculatePath = function (map, unit, targetX, targetY)
    {
        this.map = map;
        this.unit = unit;

        var currentNode;
        for (var i = 0; i < this.completedNodes.length; ++i)
        {
            if (this.completedNodes[i].x === targetX && this.completedNodes[i].y === targetY)
            {
                currentNode = this.completedNodes[i];
                break;
            }
        }

        if (!currentNode)
            return;

        var pathNodes = [];
        while (currentNode.x !== unit.tileX || currentNode.y !== unit.tileY)
        {
            pathNodes.unshift(currentNode);
            currentNode = this.findClosestNeighbor(currentNode);
        }

        this.map = null;
        this.unit = null;
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

    PathManager.prototype.calculateAvailableTiles = function (map, unit)
    {
        var currentNode = { distance: 0, x: unit.tileX, y: unit.tileY, tile: map.getTile(unit.tileX, unit.tileY), neighbors: [] };

        this.map = map;
        this.unit = unit;

        this.completedNodes = [];
        this.processingNodes = [currentNode];

        while (true)
        {
            currentNode = this.getClosestTile(this.processingNodes);
            if (currentNode == null || currentNode.distance === Infinity || currentNode.distance > unit.ap)
            {
                // We're past the boundary that the unit can move
                break;
            }

            this.completedNodes.push(currentNode);

            var diagonalDistance = currentNode.distance + this.diagonalMoveCost;
            if (this.canMoveToDiagonal(currentNode, -1, -1))
                this.evaluateNeighbor(currentNode, -1, -1, diagonalDistance);

            if (this.canMoveToDiagonal(currentNode, 1, -1))
                this.evaluateNeighbor(currentNode, 1, -1, diagonalDistance);

            if (this.canMoveToDiagonal(currentNode, -1, 1))
                this.evaluateNeighbor(currentNode, -1, 1, diagonalDistance);

            if (this.canMoveToDiagonal(currentNode, 1, 1))
                this.evaluateNeighbor(currentNode, 1, 1, diagonalDistance);

            var straightDistance = currentNode.distance + this.defaultMoveCost;
            this.evaluateNeighbor(currentNode, 0, -1, straightDistance);
            this.evaluateNeighbor(currentNode, 0, 1, straightDistance);
            this.evaluateNeighbor(currentNode, -1, 0, straightDistance);
            this.evaluateNeighbor(currentNode, 1, 0, straightDistance);
        }

        this.map = null;
        this.unit = null;

        return this.completedNodes;
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

    PathManager.prototype.evaluateNeighbor = function (currentNode, directionX, directionY, additionalDistance)
    {
        var x = currentNode.x + directionX;
        var y = currentNode.y + directionY;

        var tile = this.map.getTile(x, y);
        if (tile)
        {
            if (!this.canMoveToTile(currentNode, directionX, directionY))
                return;

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

            var distance = additionalDistance + tile.height;
            if (distance < node.distance)
                node.distance = distance;

            currentNode.neighbors.push(node);
        }
    };

    return new PathManager();
});