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

define('Game/src/turnManager', function ()
{
    function TurnManager() {}

    TurnManager.unitList = [];
    TurnManager.endTurn = function () {};

    return TurnManager;
});

require(['src/map', 'src/soldier'], function (Map, Soldier)
{
    'use strict';

    var MapTest = new TestCase('MapTest');

    MapTest.prototype.testGetTile = function ()
    {
        var map = new Map(20, 20, 1);

        var tileIndex = 0;
        for (var y = 0; y < 20; y++)
        {
            for (var x = 0; x < 20; x++)
            {
                assertTrue(map.tiles[tileIndex++] === map.getTile(x, y));
            }
        }
    };

    MapTest.prototype.testMoveUnit = function ()
    {
        var map = new Map(20, 20, 10);

        var soldier = new Soldier();
        map.addUnit(soldier, 0, 0);

        assertTrue(map.getTile(0, 0).unit === soldier);
        assertTrue(map.getTile(1, 1).unit == null);

        map.moveActiveUnit(1, 1);

        assertTrue(map.getTile(0, 0).unit == null);
        assertTrue(map.getTile(1, 1).unit === soldier);
    };
});