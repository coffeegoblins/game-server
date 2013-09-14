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

    function canMoveToDiagonal(map, x, y, directionX, directionY)
    {
        var tile = map.getTile(x + directionX, y + directionY);
        if (tile && (tile.content || tile.unit))
            return false;

        tile = map.getTile(x + directionX, y);
        if (tile && (tile.content || tile.unit))
            return false;

        tile = map.getTile(x, y + directionY);
        if (tile && (tile.content || tile.unit))
            return false;

        return true;
    }

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
            if (canMoveToDiagonal(map, currentNode.x, currentNode.y, -1, -1))
                this.evaluateNeighbor(currentNode, currentNode.x - 1, currentNode.y - 1, diagonalDistance);

            if (canMoveToDiagonal(map, currentNode.x, currentNode.y, 1, -1))
                this.evaluateNeighbor(currentNode, currentNode.x + 1, currentNode.y - 1, diagonalDistance);

            if (canMoveToDiagonal(map, currentNode.x, currentNode.y, -1, 1))
                this.evaluateNeighbor(currentNode, currentNode.x - 1, currentNode.y + 1, diagonalDistance);

            if (canMoveToDiagonal(map, currentNode.x, currentNode.y, 1, 1))
                this.evaluateNeighbor(currentNode, currentNode.x + 1, currentNode.y + 1, diagonalDistance);

            var straightDistance = currentNode.distance + this.defaultMoveCost;
            this.evaluateNeighbor(currentNode, currentNode.x, currentNode.y - 1, straightDistance);
            this.evaluateNeighbor(currentNode, currentNode.x, currentNode.y + 1, straightDistance);
            this.evaluateNeighbor(currentNode, currentNode.x - 1, currentNode.y, straightDistance);
            this.evaluateNeighbor(currentNode, currentNode.x + 1, currentNode.y, straightDistance);
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

    PathManager.prototype.evaluateNeighbor = function (currentNode, x, y, additionalDistance)
    {
        var tile = this.map.getTile(x, y);
        if (tile)
        {
            // Don't allow traversal over other units
            if (tile.unit != null)
                return;

            // Don't allow traversal over world objects
            var isClimbable;
            if (tile.content)
            {
                // Unless this unit can climb them
                if (tile.content.isClimbable && this.unit.canClimbObjects)
                {
                    isClimbable = true;
                }
                else
                {
                    return;
                }
            }

            // Don't allow traversal over nodes with an unclimbable height gap
            if (Math.abs(currentNode.tile.height - tile.height) > this.unit.maxMoveableHeight && !isClimbable)
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