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

module.exports = {
    DualKeyHash: require('../dualKeyHash'),
    tileDirections: tileDirections,

    beginMoveUnit: function (map, unit, tileNode)
    {
        this.breakCombatLock(unit);
        map.getTile(unit.x, unit.y).unit = null;
        return this.getMoveCost(unit, tileNode.distance);
    },

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
        if (!destinationTile || destinationTile.unit || !destinationTile.isTraversable)
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

    endMoveUnit: function (unit, tileNode, cost)
    {
        unit.ap -= cost;
        unit.x = tileNode.x;
        unit.y = tileNode.y;
        tileNode.tile.unit = unit;
    },

    getMoveNodes: function (map, unit)
    {
        var currentNodes = new this.DualKeyHash();
        var completedNodes = new this.DualKeyHash();

        var maxDistance = unit.ap / this.unitData[unit.type].moveCost;
        var currentNode = {
            distance: 0,
            x: unit.x,
            y: unit.y,
            neighbors: [],
            tile: map.getTile(unit.x, unit.y)
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
                    newNode = {
                        distance: Infinity,
                        x: x,
                        y: y,
                        tile: tile,
                        neighbors: [currentNode]
                    };
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
        completedNodes.remove(unit.x, unit.y);
        return completedNodes.toArray();
    },

    moveUnit: function (map, unit, tileNode)
    {
        this.endMoveUnit(unit, tileNode, this.beginMoveUnit(map, unit, tileNode));
    }
};
