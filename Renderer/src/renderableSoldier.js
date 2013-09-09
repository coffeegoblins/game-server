define(['Game/src/imageCache'], function (ImageCache)
{
    'use strict';

    function RenderableSoldier(soldier, unitImage, previewImage)
    {
        this.unit = soldier;
        this.unitImage = unitImage;
        this.previewImage = previewImage;

        ImageCache.loadImage(unitImage, unitImage);
        ImageCache.loadImage(previewImage, unitImage);
    }

    RenderableSoldier.prototype.isVisible = function (left, right, top, bottom)
    {
        return  this.unit.tileX <= right &&
                this.unit.tileY <= bottom &&
                this.unit.tileX >= left &&
                this.unit.tileY >= top;
    };

    RenderableSoldier.prototype.render = function (context, scale, viewportRect)
    {
        var image = ImageCache.getImage(this.unitImage);
        if (image)
        {
            var size = Math.floor(scale * 0.8);
            var offset = 1 + ((scale - size) / 2);

            var xPosition = this.unit.tileX * scale + offset - viewportRect.x;
            var yPosition = this.unit.tileY * scale + offset - viewportRect.y;

            context.drawImage(image.data, 0, 0, image.width, image.height, xPosition, yPosition, size, size);
        }
    };

    return RenderableSoldier;
});