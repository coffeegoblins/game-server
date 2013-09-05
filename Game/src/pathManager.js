define(['renderer'], function (Renderer)
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

    PathManager.prototype.calculateAvailableTiles = function(map, unit)
    {
        var currentNode = { distance:0, x: unit.tileX, y: unit.tileY };
        this.map = map;
        this.completedNodes = [];
        this.processingNodes = [currentNode];

        while (true)
        {
            currentNode = this.getClosestTile(this.processingNodes);

            if(currentNode.distance > unit.ap)
            {
                // We're past the boundary that the unit can move
                Renderer.setRenderablePath(this.completedNodes, unit.ap);
                return;
            }

            this.completedNodes.push(currentNode);

            var diagonalDistance = currentNode.distance + this.diagonalMoveCost;
            this.evaluateNeighbor(currentNode.x - 1, currentNode.y - 1, diagonalDistance);
            this.evaluateNeighbor(currentNode.x + 1, currentNode.y - 1, diagonalDistance);
            this.evaluateNeighbor(currentNode.x - 1, currentNode.y + 1, diagonalDistance);
            this.evaluateNeighbor(currentNode.x + 1, currentNode.y + 1, diagonalDistance);

            var straightDistance = currentNode.distance + this.defaultMoveCost;
            this.evaluateNeighbor(currentNode.x, currentNode.y - 1, straightDistance);
            this.evaluateNeighbor(currentNode.x, currentNode.y + 1, straightDistance);
            this.evaluateNeighbor(currentNode.x - 1, currentNode.y, straightDistance);
            this.evaluateNeighbor(currentNode.x + 1, currentNode.y, straightDistance);
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

    PathManager.prototype.evaluateNeighbor = function(x, y, additionalDistance)
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
                node = {distance: Infinity, x: x, y: y};
                this.processingNodes.push(node);
            }

            var distance = additionalDistance + tile.height;

            if (tile.unit != null)
                distance = Infinity;

            if (distance < node.distance)
                node.distance = distance;
        }
    };

    return new PathManager();
});