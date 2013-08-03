define([], function ()
{
    'use strict';

    /**
     * @param width The number of tiles on the horizontal axis of the map
     * @param height The number of tiles on the vertical axis of the map
     * @param tileSize The size of the tiles in game space
     * @constructor
     */
    function Map(width, height, tileSize)
    {
        this.width = width;
        this.height = height;

        this.tiles = [];
        this.tileSize = tileSize || 16;

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

    /**
     * @param x The x coordinate of the tile in the tile array
     * @param y The y coordinate of the tile in the tile array
     */
    Map.prototype.getTile = function (x, y)
    {
        return this.tiles[x + y * this.width];
    };

    /**
     * @param x The x coordinate of the tile in game space
     * @param y The y coordinate of the tile in game space
     */
    Map.prototype.getTileAtPosition = function (x, y)
    {
        x = Math.floor(x / this.tileSize);
        y = Math.floor(y / this.tileSize);
        return this.tiles[x + y * this.width];
    };

    Map.prototype.maxHeight = 16;

    return Map;
});