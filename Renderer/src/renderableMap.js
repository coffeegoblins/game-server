define(['Game/src/spriteSheet'], function (SpriteSheet)
{
    'use strict';

    function RenderableMap(map)
    {
        this.map = map;
        if (map.backgroundSpriteSheet)
            this.backgroundSpriteSheet = new SpriteSheet('background', 'Renderer/content/' + map.backgroundSpriteSheet + '.png');

        if (map.foregroundSpriteSheet)
            this.foregroundSpriteSheet = new SpriteSheet('foreground', 'Renderer/content/' + map.foregroundSpriteSheet + '.png');
    }

    RenderableMap.prototype.getTileAtCoordinate = function (x, y, scale)
    {
        return this.map.getTile(Math.floor(x / scale), Math.floor(y / scale));
    };

    RenderableMap.prototype.onClick = function (e, x, y, scale)
    {
        this.map.onClick(e, x, y, scale);
    };

    RenderableMap.prototype.render = function (context, deltaTime, tileSize, viewportRect)
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
                drawTile(this.backgroundSpriteSheet, tile, 'backgroundTile', x, y, tileSize, context, viewportRect);
                drawTile(this.foregroundSpriteSheet, tile, 'foregroundTile', x, y, tileSize, context, viewportRect);
            }
        }
    };

    function drawTile(spriteSheet, tile, property, x, y, tileSize, context, viewportRect)
    {
        if (!spriteSheet || !tile[property])
            return;

        var tileRect = spriteSheet.getTileBounds(tile[property] - 1);
        if (tileRect)
        {
            var xPosition = Math.floor(x * tileSize - viewportRect.x);
            var yPosition = Math.floor(y * tileSize - viewportRect.y);

            context.drawImage(spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, xPosition, yPosition, tileSize, tileSize);
        }
    }

    return RenderableMap;
});