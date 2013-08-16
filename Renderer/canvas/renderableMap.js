define([], function ()
{
    'use strict';

    function getColorForHeight(height, maxHeight)
    { // Convert the height to a color gradient. Low is white. High is black.
        var numericColor = Math.floor(255 * (1 - (height / maxHeight)));
        var hexColor = numericColor.toString(16);
        return '#' + hexColor + hexColor + hexColor;
    }


    function RenderableMap(map)
    {
        this.gameMap = map;
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
                    context.fillStyle = "#000000";
                    context.rect(x * tileSize + viewportRect.x, y * tileSize + viewportRect.y, tileSize, tileSize);
                    context.fill();

                    context.beginPath();
                    context.fillStyle = getColorForHeight(tile.height, this.gameMap.maxHeight);
                    context.rect(x * tileSize + 2 + viewportRect.x, y * tileSize + 2 + viewportRect.y, tileSize - 2, tileSize - 2);
                    context.fill();
                }
            }
        }
    };

    return RenderableMap;
});