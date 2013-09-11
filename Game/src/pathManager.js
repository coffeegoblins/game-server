define([], function ()
{
    'use strict';

    /**
     * @constructor
     */
    function PathManager()
    {
        this.defaultMoveCost = 10;
        this.diagonalMoveCost = 14;
        this.map = null;
    }

    PathManager.prototype.calculatePath = function(map, unit, targetX, targetY)
    {
        var currentNode = null;

        for (var i = 0; i < this.completedNodes.length; ++i)
        {
            if (this.completedNodes[i].x == targetX && this.completedNodes[i].y == targetY)
            {
                currentNode = this.completedNodes[i];
                break;
            }
        }

        var pathNodes = [];

        while(currentNode.x != unit.tileX || currentNode.y != unit.tileY)
        {
            pathNodes.unshift(currentNode);

            currentNode = this.findClosestNeighbor(currentNode);
        }

        return pathNodes;
    };

    PathManager.prototype.findClosestNeighbor = function(node)
    {
        var lowestIndex = 0;

        for (var i = 0; i < node.neighbors.length; ++i)
        {
            if(node.neighbors[i].distance < node.neighbors[lowestIndex].distance)
                lowestIndex = i;
        }

        return node.neighbors[lowestIndex];
    };

    PathManager.prototype.calculateAvailableTiles = function(map, unit)
    {
        var currentNode = { distance:0, x: unit.tileX, y: unit.tileY, neighbors: [] };
        this.map = map;
        this.completedNodes = [];
        this.processingNodes = [currentNode];

        while (true)
        {
            currentNode = this.getClosestTile(this.processingNodes);

            if(currentNode == null || currentNode.distance == Infinity || currentNode.distance > unit.ap)
            {
                // We're past the boundary that the unit can move
                return this.completedNodes;
            }

            this.completedNodes.push(currentNode);

            var diagonalDistance = currentNode.distance + this.diagonalMoveCost;
            this.evaluateNeighbor(currentNode, currentNode.x - 1, currentNode.y - 1, diagonalDistance);
            this.evaluateNeighbor(currentNode, currentNode.x + 1, currentNode.y - 1, diagonalDistance);
            this.evaluateNeighbor(currentNode, currentNode.x - 1, currentNode.y + 1, diagonalDistance);
            this.evaluateNeighbor(currentNode, currentNode.x + 1, currentNode.y + 1, diagonalDistance);

            var straightDistance = currentNode.distance + this.defaultMoveCost;
            this.evaluateNeighbor(currentNode, currentNode.x, currentNode.y - 1, straightDistance);
            this.evaluateNeighbor(currentNode, currentNode.x, currentNode.y + 1, straightDistance);
            this.evaluateNeighbor(currentNode, currentNode.x - 1, currentNode.y, straightDistance);
            this.evaluateNeighbor(currentNode, currentNode.x + 1, currentNode.y, straightDistance);
        }
    };

    PathManager.prototype.getClosestTile = function(nodes)
    {
        var lowestIndex = 0;

        for (var i = 0; i < nodes.length; ++i)
        {
            if(nodes[i].distance < nodes[lowestIndex].distance)
                lowestIndex = i;
        }

        return nodes.splice(lowestIndex, 1)[0];
    };

    PathManager.prototype.evaluateNeighbor = function(currentNode, x, y, additionalDistance)
    {
        var tile = this.map.getTile(x, y);
        if (tile)
        {
            for (var i = 0; i < this.completedNodes.length; ++i)
            {
                if (this.completedNodes[i].x == x && this.completedNodes[i].y == y)
                    return;
            }

            var node = null;
            for (i = 0; i < this.processingNodes.length; ++i)
            {
                if (this.processingNodes[i].x == x && this.processingNodes[i].y == y)
                    node = this.processingNodes[i];
            }

            if(!node)
            {
                node = {distance: Infinity, x: x, y: y, neighbors: [currentNode]};
                this.processingNodes.push(node);
            }

            var distance = additionalDistance + tile.height;

            if (tile.unit != null)
            {
                distance = Infinity;
                return;
            }

            if (distance < node.distance)
                node.distance = distance;

            currentNode.neighbors.push(node);
        }
    };

    return new PathManager();
});