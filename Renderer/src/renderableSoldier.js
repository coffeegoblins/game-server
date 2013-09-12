define(['Game/src/imageCache'], function (ImageCache)
{
    'use strict';

    function RenderableSoldier(soldier, unitImage, previewImage)
    {
        this.unit = soldier;
        this.unitImage = ImageCache.loadImage(unitImage, unitImage);
        this.previewImage = previewImage;
    }

    RenderableSoldier.prototype.isVisible = function (left, right, top, bottom)
    {
        return  this.unit.tileX <= right &&
                this.unit.tileY <= bottom &&
                this.unit.tileX >= left &&
                this.unit.tileY >= top;
    };

    RenderableSoldier.prototype.render = function (context, tileSize, viewportRect)
    {
        if (this.unitImage.isLoaded)
        {
            var size = Math.floor(tileSize * 0.8);
            var offset = 1 + ((tileSize - size) / 2);

            var xPosition = this.unit.tileX * tileSize + offset - viewportRect.x;
            var yPosition = this.unit.tileY * tileSize + offset - viewportRect.y;

            context.drawImage(this.unitImage.data, xPosition, yPosition, size, size);
        }
    };

    return RenderableSoldier;
});