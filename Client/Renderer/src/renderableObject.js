define(['Core/src/spriteSheet'], function (SpriteSheet)
{
    'use strict';

    function RenderableObject(object)
    {
        this.object = object;

        var size;
        if (this.object.type === 'tree')
            size = {tileWidth: 64, tileHeight: 64};

        var path = 'Renderer/content/images/' + this.object.type + '.png';
        this.spriteSheet = new SpriteSheet(this.object.type, path, size);
        this.spriteSheet.setCurrentTile(object.style);
    }

    RenderableObject.prototype.render = function (context, deltaTime, camera)
    {
        if (!this.spriteSheet.image.isLoaded)
            return;

        var tileRect = this.spriteSheet.getCurrentTileBounds();
        if (tileRect)
        {
            var position = camera.tileToScreen(this.object.tileX, this.object.tileY);
            position.x += 16 - camera.viewportRect.x;
            position.y += -16 - camera.viewportRect.y;

            var imageWidth = this.spriteSheet.tileWidth * camera.scale;
            var imageHeight = this.spriteSheet.tileHeight * camera.scale;

            context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height,
                position.x, position.y, imageWidth, imageHeight);
        }
    };

    return RenderableObject;
});
