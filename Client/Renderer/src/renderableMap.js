define(['Core/src/spriteSheet'], function (SpriteSheet)
{
    'use strict';

    function RenderableMap(map)
    {
        this.map = map;
        if (map.spriteSheet)
        {
            var filePath = 'Renderer/content/images/' + map.spriteSheet + '.png';
            this.tileSheet = new SpriteSheet('background', filePath, {
                tileHeight: 48,
                tileWidth: 96
            });
        }
    }

    RenderableMap.prototype.getTileAtCoordinate = function (x, y, scale)
    {
        return this.map.getTile(Math.floor(x / scale), Math.floor(y / scale));
    };

    RenderableMap.prototype.onClick = function (e, x, y)
    {
        this.map.onClick(e, x, y);
    };

    RenderableMap.prototype.render = function (context, camera)
    {
        if (!this.tileSheet.isLoaded)
            return;

        var viewportLeft = camera.viewportRect.x;
        var viewportTop = camera.viewportRect.y;

        for (var x = 0; x < this.map.width; x++)
        {
            for (var y = 0; y < this.map.height; y++)
            {
                var tile = this.map.getTile(x, y);
                if (!tile.spriteIndex)
                    continue;

                var tileRect = this.tileSheet.getTileBounds(tile.spriteIndex - 1);
                if (tileRect)
                {
                    var position = camera.tileToScreen(x, y);
                    context.drawImage(this.tileSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height,
                            position.x - viewportLeft, position.y - viewportTop, camera.tileWidth, camera.tileHeight);
                }
            }
        }
    };

    return RenderableMap;
});
