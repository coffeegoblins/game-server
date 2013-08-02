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
        this.map = map;
    }

    RenderableMap.prototype.render = function (context, scale, viewportRect)
    {
        var tileSize = this.map.tileSize * scale;

        var xTileStart = Math.floor(viewportRect.x / tileSize);
        var xTileEnd = Math.ceil((viewportRect.x + viewportRect.width) / tileSize);

        var yTileStart = Math.floor(viewportRect.y / tileSize);
        var yTileEnd = Math.ceil((viewportRect.y + viewportRect.height) / tileSize);

        for (var x = xTileStart; x < xTileEnd; x++)
        {
            for (var y = yTileStart; y < yTileEnd; y++)
            {
                var tile = this.map.getTile(x, y);
                if (tile)
                {
                    context.beginPath();
                    context.fillStyle = getColorForHeight(tile.height, this.map.maxHeight);
                    context.rect(x * tileSize, y * tileSize, tileSize, tileSize);
                    context.fill();
                }
            }
        }
    };

    return RenderableMap;
});