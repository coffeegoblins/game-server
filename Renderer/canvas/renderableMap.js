define([], function ()
{
    'use strict';

    function RenderableMap(map)
    {
        this.gameMap = map;
    }

    function getColorForHeight(height, maxHeight)
    {  // Convert the height to a color gradient. High is white. Low is black.
        var numericColor = 128 + Math.floor(128 * (height / maxHeight));
        var hexColor = numericColor.toString(16);
        return '#' + hexColor + hexColor + hexColor;
    }

    RenderableMap.prototype.render = function (context, scale, viewportRect)
    {
        var tileSize = this.gameMap.tileSize * scale;

        var xTileStart = Math.floor(viewportRect.x / tileSize);
        var xTileEnd = Math.ceil((viewportRect.x + viewportRect.width) / tileSize);

        var yTileStart = Math.floor(viewportRect.y / tileSize);
        var yTileEnd = Math.ceil((viewportRect.y + viewportRect.height) / tileSize);

        for (var x = xTileStart; x < xTileEnd; x++)
        {
            for (var y = yTileStart; y < yTileEnd; y++)
            {
                var tile = this.gameMap.getTile(x, y);
                if (tile)
                {
                    context.beginPath();
                    context.fillStyle = getColorForHeight(tile.height, this.gameMap.maxHeight);
                    context.rect(x * tileSize + 1 - viewportRect.x, y * tileSize + 1 - viewportRect.y, tileSize - 1, tileSize - 1);
                    context.fill();
                }
            }
        }
    };

    return RenderableMap;
});