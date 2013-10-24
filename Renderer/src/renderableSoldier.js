define(['Game/src/imageCache', 'Game/src/spriteSheet'], function (ImageCache, SpriteSheet)
{
    'use strict';

    function createAnimation(name)
    {
        var anim = soldierAnimations.archer.animations[name];
        var spriteSheet = new SpriteSheet(anim.spriteSheet, 'Renderer/content/' + anim.spriteSheet + '.png', {
            tileWidth: anim.tileWidth,
            tileHeight: anim.tileHeight
        });

        spriteSheet.defineAnimation(name, anim);
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
                this.idleSheet = createAnimation('idle');
                this.walkSheet = createAnimation('walk');
                this.runSheet = createAnimation('run');
                this.attackSheet = createAnimation('attack');

                this.currentAnimation = this.idleSheet;
                this.currentAnimation.playAnimation(this.currentAnimation.animations[0]);
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
        if (this.currentAnimation)
        {
            if (this.currentAnimation.image.isLoaded)
            {
                xPosition = this.unit.tileX * tileSize - viewportRect.x;
                yPosition = this.unit.tileY * tileSize - viewportRect.y;

                this.currentAnimation.updateAnimation(deltaTime);
                var tileRect = this.currentAnimation.getCurrentTileBounds();

                context.globalAlpha = this.style.opacity;
                context.drawImage(this.currentAnimation.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, xPosition, yPosition, tileSize, tileSize);
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