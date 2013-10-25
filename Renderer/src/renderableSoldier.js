define(['Game/src/imageCache', 'Game/src/spriteSheet'], function (ImageCache, SpriteSheet)
{
    'use strict';

    function createSpriteSheet(type)
    {
        var animationDefinition = soldierAnimations[type];
        var spriteSheet = new SpriteSheet(animationDefinition.spriteSheet, 'Renderer/content/' + animationDefinition.spriteSheet + '.png', {
            tileWidth: animationDefinition.tileWidth,
            tileHeight: animationDefinition.tileHeight
        });

        for (var property in animationDefinition.animations)
        {
            var anim = animationDefinition.animations[property];
            if (anim)
            {
                spriteSheet.defineAnimation(property, anim);
            }
        }

        return spriteSheet;
    }

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
            this.unitImage = ImageCache.loadImage(unitImage, path);
            if (!this.previewImage)
                this.previewImage = path;
        }

        switch (this.unit.type)
        {
            case 'Archer':
                this.spriteSheet = createSpriteSheet('archer');
                this.spriteSheet.playAnimation('idle');
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
        if (this.spriteSheet)
        {
            if (this.spriteSheet.image.isLoaded)
            {
                xPosition = this.unit.tileX * tileSize - viewportRect.x;
                yPosition = this.unit.tileY * tileSize - viewportRect.y;

                this.spriteSheet.updateAnimation(deltaTime);
                var tileRect = this.spriteSheet.getCurrentTileBounds();

                context.globalAlpha = this.style.opacity;
                context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, xPosition, yPosition, tileSize, tileSize);
                context.globalAlpha = 1;
            }
        }
        else if (this.unitImage.isLoaded)
        {
            var size = Math.floor(tileSize * 0.8);
            var offset = 1 + ((tileSize - size) / 2);

            xPosition = this.unit.tileX * tileSize + offset - viewportRect.x;
            yPosition = this.unit.tileY * tileSize + offset - viewportRect.y;

            context.globalAlpha = this.style.opacity;
            context.drawImage(this.unitImage.data, xPosition, yPosition, size, size);
            context.globalAlpha = 1;
        }
    };

    return RenderableSoldier;
});