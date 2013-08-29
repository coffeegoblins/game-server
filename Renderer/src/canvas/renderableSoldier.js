define(['Game/src/imageCache'], function (ImageCache)
{
    'use strict';

    function RenderableSoldier(soldier)
    {
        this.soldier = soldier;

        ImageCache.loadImage('soldier', 'Renderer/src/canvas/content/awesome.png');
    }

    RenderableSoldier.prototype.isVisible = function (left, right, top, bottom)
    {
        return  this.soldier.tileX <= right &&
                this.soldier.tileY <= bottom &&
                this.soldier.tileX >= left &&
                this.soldier.tileY >= top;
    };

    RenderableSoldier.prototype.render = function (context, scale, viewportRect)
    {
        var image = ImageCache.getImage('soldier');
        if (image)
        {
            var size = Math.floor(scale * 0.8);
            var offset = 1 + ((scale - size) / 2);

            var xPosition = this.soldier.tileX * scale + offset - viewportRect.x;
            var yPosition = this.soldier.tileY * scale + offset - viewportRect.y;

            context.drawImage(image.data, 0, 0, image.width, image.height, xPosition, yPosition, size, size);
        }
    };

    return RenderableSoldier;
});