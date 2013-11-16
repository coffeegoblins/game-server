define(['./eventManager'], function (EventManager)
{
    'use strict';

    function Map()
    {
        this.tiles = [];
    }

    Map.prototype.create = function (width, height, initialHeight)
    {
        this.width = width;
        this.height = height;

        if (initialHeight == null)
            initialHeight = 0;

        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
                this.tiles.push({height: initialHeight});
        }
    };

    Map.prototype.load = function (mapData)
    {
        this.tileSheet = mapData.tileSheet;
        this.height = mapData.heights.length;
        this.width = mapData.heights[0].length;

        for (var y = 0; y < this.height; y++)
        {
            for (var x = 0; x < this.width; x++)
            {
                var tileIndex = x + y * this.width;
                this.tiles[tileIndex] = {
                    height: mapData.heights[y][x],
                    spriteIndex: mapData.sprites[y][x]
                };
            }
        }
    };

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

        unit.tileX = x;
        unit.tileY = y;

        tile.unit = unit;
        unit.on('death', this, this.removeUnit);
    };

    Map.prototype.canMoveToTile = function (unit, tileX, tileY)
    {
        var tile = this.getTile(tileX, tileY);
        if (!tile || tile.unit)
            return false;

        if (tile.content)
        {
            if (!tile.content.isClimbable || !unit.canClimbObjects)
                return false;
        }

        return true;
    };

    Map.prototype.onClick = function (e, x, y, scale)
    {
        var tileX = Math.floor(x / scale);
        var tileY = Math.floor(y / scale);

        var tile = this.getTile(tileX, tileY);
        if (tile)
        {
            this.trigger('tileClick', tile, tileX, tileY);
        }
    };

    /**
     * @param x The x coordinate of the tile in the tile array
     * @param y The y coordinate of the tile in the tile array
     */
    Map.prototype.getTile = function (x, y)
    {
        if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
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

    Map.prototype.removeUnit = function (unit)
    {
        var tile = this.getTile(unit.tileX, unit.tileY);
        tile.unit = null;
    };

    Map.prototype.maxHeight = 16;

    EventManager.register(Map.prototype);
    return Map;
});