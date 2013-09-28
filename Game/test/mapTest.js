require(['src/map'], function (Map)
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
});