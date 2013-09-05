define(['Game/src/turnManager'], function (TurnManager)
{
    'use strict';

    /**
     * @param width The number of tiles on the horizontal axis of the renderableMap
     * @param height The number of tiles on the vertical axis of the renderableMap
     * @constructor
     */
    function Map(width, height)
    {
        this.width = width;
        this.height = height;

        this.tiles = [];
        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
                this.tiles.push({height: 0});
        }
    }

    /**
     * @param object The object to add
     * @param x The X position of target tile
     * @param y The Y position of target tile
     */
    Map.prototype.addObject = function (object, x, y)
    {
        object.tileX = x;
        object.tileY = y;

        for (var tileX = x; tileX < x + object.sizeX; tileX++)
        {
            for (var tileY = y; tileY < y + object.sizeY; tileY++)
            {
                var tile = this.getTile(tileX, tileY);
                if (tile)
                {
                    tile.content = object;
                }
            }
        }
    };

    /**
     * @param unit The unit to add
     * @param x The X position of target tile
     * @param y The Y position of target tile
     */
    Map.prototype.addUnit = function (unit, x, y)
    {
        var tile = this.getTile(x, y);
        tile.unit = unit;

        unit.move(tile, x, y);

        TurnManager.unitList.push(unit);
    };

    /**
     * @param x The x coordinate of the target tile in the tile array
     * @param y The y coordinate of the target tile in the tile array
     */
    Map.prototype.moveActiveUnit = function (x, y)
    {
        var tile = this.getTile(x, y);
        if (tile && !tile.unit && !tile.content)
        {
            var unit = TurnManager.unitList[0];
            var previousTile = this.getTile(unit.tileX, unit.tileY);
            if (previousTile && previousTile.unit === unit)
                previousTile.unit = null;

            unit.tileX = x;
            unit.tileY = y;

            tile.unit = unit;

            TurnManager.endTurn();
        }
    };

    /**
     * @param x The x coordinate of the tile in the tile array
     * @param y The y coordinate of the tile in the tile array
     */
    Map.prototype.getTile = function (x, y)
    {
        if (x < 0 || y < 0 || x > this.width || y > this.height)
            return null;

        return this.tiles[x + y * this.width];
    };

    /**
     * @param object The object to remove
     */
    Map.prototype.removeObject = function (object)
    {
        for (var tileX = object.tileX; tileX < object.tileX + object.sizeX; tileX++)
        {
            for (var tileY = object.tileY; tileY < object.tileY + object.sizeY; tileY++)
            {
                var tile = this.getTile(tileX, tileY);
                if (tile && tile.content === object)
                    tile.content = null;
            }
        }
    };

    Map.prototype.maxHeight = 10;

    return Map;
});