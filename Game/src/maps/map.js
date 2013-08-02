define([], function ()
{
    'use strict';
    function Map(width, height, tileSize)
    {
        this.width = width;
        this.height = height;

        this.tiles = [];
        this.tileSize = tileSize;

        for (var x = 0; x < width; x++)
        {
            for (var y = 0; y < height; y++)
            {
                this.tiles.push({
                    contents: null,
                    height: 0
                });
            }
        }
    }

    Map.prototype.getTile = function (x, y)
    {
        return this.tiles[x + y * this.width];
    };

    Map.prototype.getTileAtPosition = function (x, y)
    {
        x = Math.floor(x / this.tileSize);
        y = Math.floor(y / this.tileSize);
        return this.tiles[x + y * this.width];
    };

    Map.prototype.maxHeight = 16;

    return Map;
});