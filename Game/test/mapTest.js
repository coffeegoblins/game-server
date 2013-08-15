require(['map', 'soldier'], function (Map, Soldier)
{
    'use strict';

    var MapTest = new TestCase('MapTest');

    MapTest.prototype.testGetTile = function ()
    {
        var map = new Map(20, 20, 1);

        var tileIndex = 0;
        for (var x = 0; x < 20; x++)
        {
            for (var y = 0; y < 20; y++)
                assertEquals(map.tiles[tileIndex++], map.getTile(x, y));
        }
    };

    MapTest.prototype.testGetTileAtPosition = function ()
    {
        var map = new Map(20, 20, 10);

        var tileIndex = 0;
        for (var x = 5; x < 200; x += 10)
        {
            for (var y = 5; y < 200; y += 10)
            {
                assertEquals(map.tiles[tileIndex++], map.getTileAtCoordinate(x, y));
            }
        }
    };

    MapTest.prototype.testMoveUnit = function ()
    {
        var map = new Map(20, 20, 10);

        var soldier = new Soldier();
        map.addUnit(soldier, 0, 0);

        assertNotNull(map.getTile(0, 0).unit);
        assertNull(map.getTile(1, 1).unit);

        map.moveUnit(0, 0, 1, 1);

        assertNull(map.getTile(0, 0).unit);
        assertNotNull(map.getTile(1, 1).unit);
    };
});