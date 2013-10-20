define(['Game/src/pathManager', 'Game/src/map'], function (PathManager, Map)
{
    'use strict';

    function PathManagerTest()
    {
        this.name = 'Path Manager Test';
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

    PathManagerTest.prototype.setup = function()
    {
        this.map = new Map();
        this.map.create(4, 4);
    };

    PathManagerTest.prototype.testMaxDistanceGreaterThanMapBoundary = function ()
    {
        var completedNodes = PathManager.calculateAvailableTiles(this.map, 0, 0, Infinity, 0, true);

        assertEquals('Invalid number of tiles calculated', this.map.tiles.length, completedNodes.length);
    };

    PathManagerTest.prototype.testHeightIsUsed = function ()
    {
        var topNodeHeight = 1;
        var expectedCost = PathManager.defaultMoveCost + topNodeHeight;

        this.map.getTile(0, 0).height = 1;
        this.map.getTile(0, 2).height = 2;

        var pathNodes = PathManager.calculateAvailableTiles(this.map, 0, 1, expectedCost, topNodeHeight, true);

        var topNode = getCompletedNodeAt(pathNodes, 0, 0);
        var bottomNode = getCompletedNodeAt(pathNodes, 0, 2);

        assertTruthy('Right node is null', topNode);
        assertFalsy('Bottom node is not null', bottomNode);

        assertEquals('Height did not contribute to the move factor', expectedCost, topNode.distance);
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
        this.map.getTile(1, 1).unit = {tileX: 1, tileY: 1};

        var pathNodes = PathManager.calculateAvailableTiles(this.map, 0, 0, 20, 0, false);
        var targetNode = getCompletedNodeAt(pathNodes, 1, 1);

        assertFalsy('Tile was not blocked by unit', targetNode);
    };

    PathManagerTest.prototype.testWorldObjectBlocksTile = function ()
    {
        this.map.addObject({sizeX: 1, sizeY: 1}, 1, 1);

        var pathNodes = PathManager.calculateAvailableTiles(this.map, 0, 0, 20, 0, false);
        var targetNode = getCompletedNodeAt(pathNodes, 1, 1);

        assertFalsy('Tile was not blocked by world object', targetNode);
    };

    PathManagerTest.prototype.testDiagonalMovementNearWorldObjects = function ()
    {
        this.map.addObject({sizeX: 1, sizeY: 1}, 1, 1);

        var nodes = PathManager.calculateAvailableTiles(this.map, 1, 0, 20, 10, true);
        var pathNodes = PathManager.calculatePathFromNodes(nodes, 1, 0, 2, 1);

        assertEquals('Path was not the correct length', 2, pathNodes.length);
        assertTruthy('First path node was incorrect', pathNodes[0].x === 2 && pathNodes[0].y === 0);
        assertTruthy('Second path node was incorrect', pathNodes[1].x === 2 && pathNodes[1].y === 1);
    };

    PathManagerTest.prototype.testProhibitiveTileHeightDifferences = function ()
    {
        var unit = {ap: 20, maxMoveableHeight: 2, tileX: 1, tileY: 0};
        this.map.getTile(1, 1).height = 3;

        var pathNodes = PathManager.calculateAvailableTiles(this.map, 0, 0, 20, 2, false);
        var targetNode = getCompletedNodeAt(pathNodes, 1, 1);

        assertFalsy('Tile was not blocked by prohibitive height difference', targetNode);
    };

    PathManagerTest.prototype.testClimbableWorldObjects = function ()
    {
        this.map.addObject({isClimbable: true, sizeX: 1, sizeY: 1}, 1, 1);

        this.map.getTile(1, 1).height = 10;
        this.map.getTile(1, 2).height = 10;

        var targetNode = getCompletedNodeAt(PathManager.calculateAvailableTiles(this.map, 1, 0, 20, 2, true, true), 1, 1);

        assertTruthy('Climbable object could not be accessed', targetNode);
    };

    PathManagerTest.prototype.testDiagonalMovementNearClimbableWorldObjects = function ()
    {
        this.map.addObject({isClimbable: true, sizeX: 1, sizeY: 1}, 1, 1);

        var pathNodes = PathManager.calculateAvailableTiles(this.map, 1, 0, 20, 0, true, true);
        var targetPath = PathManager.calculatePathFromNodes(pathNodes, 1, 0, 2, 1);

        assertEquals('Path was not the correct length', 1, targetPath.length);
        assertTruthy('Path node was incorrect', targetPath[0].x === 2 && targetPath[0].y === 1);
    };

    return PathManagerTest;
});