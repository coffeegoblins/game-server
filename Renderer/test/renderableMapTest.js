require(['canvas/renderableMap'], function (RenderableMap)
{
    'use strict';

    var RenderableMapTest = new TestCase('RenderableMapTest');

    var mapWidth = 20;
    var mapHeight = 20;
    var tileSize = 10;

    RenderableMapTest.prototype.setUp = function ()
    {
        this.mockMap = {
            tiles: [],
            getTile: function (x, y) { return this.tiles[x + y * mapWidth]; }
        };

        for (var y = 0; y < mapHeight; y++)
        {
            for (var x = 0; x < mapWidth; x++)
                this.mockMap.tiles.push({});
        }
    };

    RenderableMapTest.prototype.testGetTileAtPosition = function ()
    {
        var map = new RenderableMap(this.mockMap);

        var tileIndex = 0;
        for (var y = tileSize / 2; y < mapHeight * tileSize; y += tileSize)
        {
            for (var x = tileSize / 2; x < mapWidth * tileSize; x += tileSize)
            {
                assertTrue(this.mockMap.tiles[tileIndex++] === map.getTileAtCoordinate(x, y, tileSize));
            }
        }
    };
});