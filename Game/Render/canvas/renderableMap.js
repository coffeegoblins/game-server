define([], function ()
{
    'use strict';
    function RenderableMap(map)
    {
        this.map = map;
    }

    RenderableMap.prototype.render = function (context, viewportRect)
    {
        var tileSize = this.map.tileSize;
        context.strokeStyle = '#cdcdcd';
        context.lineWidth = 0.5;

        var x = tileSize - (viewportRect.x % tileSize);
        for (; x < viewportRect.width; x += tileSize)
        {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, viewportRect.height);
            context.stroke();
        }

        var y = tileSize - (viewportRect.y % tileSize);
        for (; y < viewportRect.height; y += tileSize)
        {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(viewportRect.width, y);
            context.stroke();
        }
    };

    return RenderableMap;
});