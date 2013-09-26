require(['src/pathManager'], function (PathManager)
{
    'use strict';

    function MockMap()
    {
        this.tiles = [];
        for (var x = 0; x < 4; x++)
        {
            this.tiles[x] = [];
            for (var y = 0; y < 4; y++)
                this.tiles[x][y] = {height: 0};
        }

        this.addObject = function (object, x, y)
        {
            this.tiles[x][y].content = object;
        };

        this.getTile = function (x, y)
        {
            var row = this.tiles[x];
            if (row)
                return row[y];
        };
    }

    function getCompletedNodeAt(completedNodes, x, y)
    {
        for (var i = 0; i < completedNodes.length; ++i)
        {
            var node = completedNodes[i];
            if (node.x === x && node.y === y)
                return node;
        }
    }

    var PathManagerTest = new TestCase('PathManagerTest');

    PathManagerTest.prototype.testAPGreaterThanBoundary = function ()
    {
        var map = new MockMap();
        var unit = {ap: PathManager.diagonalMoveCost * 10, tileX: 0, tileY: 0};

        var completedNodes = PathManager.calculateAvailableTiles(map, unit);
        assertEquals('Invalid number of tiles calculated', 16, completedNodes.length);
    };

    PathManagerTest.prototype.testHeightIsUsed = function ()
    {
        var map = new MockMap();
        var unit = {ap: PathManager.diagonalMoveCost + 1, maxMoveableHeight: 2, tileX: 0, tileY: 0};
        map.getTile(1, 1).height = 1;

        var targetNode = getCompletedNodeAt(PathManager.calculateAvailableTiles(map, unit), 1, 1);

        assertNotNull('Target Node is null', targetNode);
        assertEquals('Height did not contribute to the move factor', PathManager.diagonalMoveCost + 1, targetNode.distance);
    };

    PathManagerTest.prototype.testGetClosestTile = function ()
    {
        var nodes = [
            {distance: 10},
            {distance: Infinity},
            {distance: 5},
            {distance: 4}
        ];

        var returnedNode = PathManager.getClosestTile(nodes);
        assertEquals('Incorrect node was returned.', 4, returnedNode.distance);
    };

    PathManagerTest.prototype.testUnitBlocksTile = function ()
    {
        var map = new MockMap();
        var unit = {ap: 20, tileX: 0, tileY: 0};
        map.getTile(1, 1).unit = {tileX: 1, tileY: 1};

        var targetNode = getCompletedNodeAt(PathManager.calculateAvailableTiles(map, unit), 1, 1);
        assertUndefined('Tile was not blocked by unit', targetNode);
    };

    PathManagerTest.prototype.testWorldObjectBlocksTile = function ()
    {
        var map = new MockMap();
        var unit = {ap: 20, tileX: 0, tileY: 0};
        map.addObject({sizeX: 1, sizeY: 1}, 1, 1);

        var targetNode = getCompletedNodeAt(PathManager.calculateAvailableTiles(map, unit), 1, 1);
        assertUndefined('Tile was not blocked by world object', targetNode);
    };

    PathManagerTest.prototype.testDiagonalMovementNearWorldObjects = function ()
    {
        var map = new MockMap();
        var unit = {ap: 20, tileX: 1, tileY: 0};
        map.addObject({sizeX: 1, sizeY: 1}, 1, 1);

        PathManager.calculateAvailableTiles(map, unit);
        var pathNodes = PathManager.calculatePath(map, unit, 2, 1);

        assertEquals('Path was not the correct length', 2, pathNodes.length);
        assertTrue('First path node was incorrect', pathNodes[0].x === 2 && pathNodes[0].y === 0);
        assertTrue('Second path node was incorrect', pathNodes[1].x === 2 && pathNodes[1].y === 1);
    };

    PathManagerTest.prototype.testProhibitiveTileHeightDifferences = function ()
    {
        var map = new MockMap();
        var unit = {ap: 20, maxMoveableHeight: 2, tileX: 1, tileY: 0};
        map.getTile(1, 1).height = 3;

        var targetNode = getCompletedNodeAt(PathManager.calculateAvailableTiles(map, unit), 1, 1);
        assertUndefined('Tile was not blocked by prohibitive height difference', targetNode);
    };

    PathManagerTest.prototype.testClimbableWorldObjects = function ()
    {
        var map = new MockMap();
        var unit = {ap: 20, canClimbObjects: true, maxMoveableHeight: 2, tileX: 1, tileY: 0};
        map.addObject({isClimbable: true, sizeX: 1, sizeY: 1}, 1, 1);

        map.getTile(1, 1).height = 10;
        map.getTile(1, 2).height = 10;

        var targetNode = getCompletedNodeAt(PathManager.calculateAvailableTiles(map, unit), 1, 1);
        assertNotUndefined('Climbable object could not be accessed', targetNode);

        var pathNodes = PathManager.calculatePath(map, unit, 1, 2);
        assertEquals('Path was not the correct length', 2, pathNodes.length);
        assertTrue('First path node was incorrect', pathNodes[0].x === 1 && pathNodes[0].y === 1);
        assertTrue('Second path node was incorrect', pathNodes[1].x === 1 && pathNodes[1].y === 2);
    };

    PathManagerTest.prototype.testDiagonalMovementNearClimbableWorldObjects = function ()
    {
        var map = new MockMap();
        var unit = {ap: 20, canClimbObjects: true, tileX: 1, tileY: 0};
        map.addObject({isClimbable: true, sizeX: 1, sizeY: 1}, 1, 1);

        PathManager.calculateAvailableTiles(map, unit);
        var pathNodes = PathManager.calculatePath(map, unit, 2, 1);

        assertEquals('Path was not the correct length', 1, pathNodes.length);
        assertTrue('Path node was incorrect', pathNodes[0].x === 2 && pathNodes[0].y === 1);
    };
});