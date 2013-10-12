define(['Game/src/imageCache', 'Game/src/spriteSheet'], function (ImageCache, SpriteSheet)
{
    'use strict';

    function RenderableSoldier(unit, unitImage, previewImage)
    {
        this.unit = unit;
        this.style = {};
        this.style.opacity = 1;

        if (previewImage)
        {
            this.previewImage = 'Renderer/content/' + previewImage + '.png';
        }

        if (unitImage)
        {
            var path = 'Renderer/content/' + unitImage + '.png';
            this.unitSheet = ImageCache.loadImage(unitImage, path);
            if (!this.previewImage)
                this.previewImage = path;
        }

        switch (this.unit.type)
        {
            case 'Archer':
                this.unitSheet = new SpriteSheet('archerSheet', 'Renderer/content/archerWalk.png', {tileWidth: 100, tileHeight: 100});
                this.unitSheet.defineAnimation('walk', 0, 15);
                this.unitSheet.playAnimation('walk');
                break;

            case 'Melee':
                break;
        }
    }

    RenderableSoldier.prototype.isVisible = function (left, right, top, bottom)
    {
        return  this.unit.tileX <= right &&
                this.unit.tileY <= bottom &&
                this.unit.tileX >= left &&
                this.unit.tileY >= top;
    };

    RenderableSoldier.prototype.render = function (context, deltaTime, tileSize, viewportRect)
    {
        var xPosition, yPosition;
        if (this.unitSheet instanceof SpriteSheet)
        {
            if (this.unitSheet.image.isLoaded)
            {
                xPosition = this.unit.tileX * tileSize - viewportRect.x;
                yPosition = this.unit.tileY * tileSize - viewportRect.y;

                this.unitSheet.updateAnimation(deltaTime);
                var tileRect = this.unitSheet.getCurrentTileBounds();

                context.globalAlpha = this.style.opacity;
                context.drawImage(this.unitSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, xPosition, yPosition, tileSize, tileSize);
                context.globalAlpha = 1;
            }
        }
        else if (this.unitSheet.isLoaded)
        {
            var size = Math.floor(tileSize * 0.8);
            var offset = 1 + ((tileSize - size) / 2);

            xPosition = this.unit.tileX * tileSize + offset - viewportRect.x;
            yPosition = this.unit.tileY * tileSize + offset - viewportRect.y;

            context.globalAlpha = this.style.opacity;
            context.drawImage(this.unitSheet.data, xPosition, yPosition, size, size);
            context.globalAlpha = 1;
        }
    };

    return RenderableSoldier;
});