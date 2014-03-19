define(['Core/src/spriteSheet'], function (SpriteSheet)
{
    'use strict';

    function RenderableObject(object)
    {
        this.object = object;

        var size;
        if (this.object.type === 'tree')
            size = {tileWidth: 96, tileHeight: 96};

        var path = 'Renderer/content/images/' + this.object.type + '.png';
        this.spriteSheet = new SpriteSheet(this.object.type, path, size);
        this.spriteSheet.setCurrentTile(object.style);
    }

    RenderableObject.prototype.getTileX = function ()
    {
        return this.object.tileX;
    };

    RenderableObject.prototype.getTileY = function ()
    {
        return this.object.tileY;
    };

    RenderableObject.prototype.render = function (context, deltaTime, camera)
    {
        if (!this.spriteSheet.image.isLoaded)
            return;

        var tileRect = this.spriteSheet.getCurrentTileBounds();
        if (tileRect)
        {
            var position = camera.tileToScreen(this.object.tileX, this.object.tileY);
            var imageWidth = this.spriteSheet.tileWidth * camera.scale;
            var imageHeight = this.spriteSheet.tileHeight * camera.scale;

            var left = position.x - camera.viewportRect.x + camera.halfTileWidth - imageWidth / 2;
            var top = position.y - camera.viewportRect.y + camera.tileHeight - imageHeight;

            context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height,
                left, top, imageWidth, imageHeight);
        }
    };

    return RenderableObject;
});
