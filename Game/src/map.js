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
                    unit:null,
                    height: 0
                });
            }
        }
    }

    /**
     * @param unit The unit to add
     * @param x The X position of target tile
     * @param y The Y position of target tile
     */
    Map.prototype.addUnit = function (unit, x, y)
    {
        this.getTile(x,y).unit = unit;
    };

    /**
     * @param x The x coordinate of the start tile in the tile array
     * @param y The y coordinate of the start tile in the tile array
     * @param x2 The x coordinate of the target tile in the tile array
     * @param y2 The y coordinate of the target tile in the tile array
     */
    Map.prototype.moveUnit = function (x, y, x2, y2)
    {
        var currentTile = this.tiles[x + y * this.width];
        var targetTile = this.tiles[x2 + y2 * this.width];

        // TODO Synchronous Move Animation
        currentTile.unit.move(x2, y2);

        targetTile.unit = currentTile.unit;
        currentTile.unit = null;
    };

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