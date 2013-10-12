define(['Game/src/spriteSheet'], function (SpriteSheet)
{
    'use strict';

    function RenderableMap(map)
    {
        this.map = map;

        if (map.tileSheet)
        {
            this.tileSheet = new SpriteSheet('terrain', 'Renderer/content/' + map.tileSheet + '.png');
        }
    }

    function getColorForHeight(height, maxHeight)
    {  // Convert the height to a color gradient. High is white. Low is black.
        var numericColor = 64 + Math.floor(192 * (height / maxHeight));
        var hexColor = numericColor.toString(16);
        return '#' + hexColor + hexColor + hexColor;
    }

    /**
     * @param x The x coordinate of the tile in game space
     * @param y The y coordinate of the tile in game space
     * @param scale The current scale of the renderer
     */
    RenderableMap.prototype.getTileAtCoordinate = function (x, y, scale)
    {
        return this.map.getTile(Math.floor(x / scale), Math.floor(y / scale));
    };

    RenderableMap.prototype.onClick = function (e, x, y, scale)
    {
        this.map.onClick(e, x, y, scale);
    };

    RenderableMap.prototype.render = function (context, tileSize, viewportRect)
    {
        this.visibleTileLeft = Math.max(0, Math.floor(viewportRect.x / tileSize));
        this.visibleTileTop = Math.max(0, Math.floor(viewportRect.y / tileSize));

        this.visibleTileRight = Math.min(this.map.width - 1, Math.ceil((viewportRect.x + viewportRect.width) / tileSize));
        this.visibleTileBottom = Math.min(this.map.height - 1, Math.ceil((viewportRect.y + viewportRect.height) / tileSize));

        for (var x = this.visibleTileLeft; x <= this.visibleTileRight; x++)
        {
            for (var y = this.visibleTileTop; y <= this.visibleTileBottom; y++)
            {
                var tile = this.map.getTile(x, y);
                if (tile.spriteIndex && this.tileSheet)
                {
                    var tileRect = this.tileSheet.getTileBounds(tile.spriteIndex - 1);
                    if (tileRect)
                    {
                        var xPosition = x * tileSize - viewportRect.x;
                        var yPosition = y * tileSize - viewportRect.y;

                        context.drawImage(this.tileSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, xPosition, yPosition, tileSize, tileSize);
                        continue;
                    }
                }

                context.beginPath();
                context.fillStyle = getColorForHeight(tile.height, this.map.maxHeight);
                context.rect(x * tileSize + 1 - viewportRect.x, y * tileSize + 1 - viewportRect.y, tileSize - 1, tileSize - 1);
                context.fill();
            }
        }
    };

    return RenderableMap;
});