// Mocking dependencies
define('renderer', function ()
{
    function MockRenderer() {}

    function MockCamera() {}

    MockCamera.prototype.moveToUnit = function () {};

    MockRenderer.camera = new MockCamera();
    MockRenderer.clearRenderablePath = function () {};

    return MockRenderer;
});

require(['src/pathManager', 'src/map'], function (PathManager, Map)
{
    'use strict';

    PathManagerTest.prototype.testAPGreaterThanBoundary = function ()
    {
        var map = new Map(4, 4);
        var unit = {ap: PathManager.diagonalMoveCost * 10, tileX: 0, tileY: 0};

        var completedNodes = PathManager.calculateAvailableTiles(map, unit);

        assertEquals("Invalid number of tiles calculated", 16, completedNodes.length);
    }

    PathManagerTest.prototype.testHeightIsUsed = function ()
    {
        var map = new Map(4, 4);
        var height = 20;
        var unit = {ap: PathManager.diagonalMoveCost + height + 1, tileX: 0, tileY: 0};

        map.getTile(1, 1).height = height;

        var completedNodes = PathManager.calculateAvailableTiles(map, unit);
        var targetNode = null;

        for (var i = 0; i < completedNodes.length; ++i)
        {
            if (completedNodes[i].x == 1 && completedNodes[i].y == 1)
            {
                targetNode = completedNodes[i];
            }
        }

        assertNotNull("Target Node is null", targetNode);
        assertEquals("Height did not contribute to the move factor", PathManager.diagonalMoveCost + height, targetNode.distance);
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

        assertEquals("Incorrect node was returned.", 4, returnedNode.distance);
    };

    PathManagerTest.prototype.testUnitBlocksTile = function ()
    {
        var map = new Map(4, 4);
        var unit = {ap: 20, tileX: 0, tileY: 0};

        map.getTile(1, 1).unit = {tileX: 1, tileY: 1};

        var completedNodes = PathManager.calculateAvailableTiles(map, unit);
        var nodeFound = false;

        for (var i = 0; i < completedNodes.length; ++i)
        {
            if (completedNodes[i].x == 1 && completedNodes[i].y == 1)
            {
                nodeFound = true;
            }
        }

        assertEquals("Tile was not blocked by unit", false, nodeFound);
    };
});