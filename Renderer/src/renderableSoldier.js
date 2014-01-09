define(['Game/src/imageCache', 'Game/src/spriteSheet', './effects/transitionEffect'], function (ImageCache, SpriteSheet, TransitionEffect)
{
    'use strict';

    function RenderableSoldier(unit)
    {
        this.unit = unit;
        this.style = {};
        this.style.opacity = 1;
        this.isSelected = false;

        this.spriteSheet = createSpriteSheet(this.unit.weapon.type);
        this.spriteSheet.playAnimation(this.unit.state);
        this.spriteSheet.on('animationComplete', this, this.onAnimationComplete);

        this.unit.on('stateChange', this.onStateChange.bind(this));
    }

    function createSpriteSheet(type)
    {
        var animationDefinition = window.soldierAnimations[type];
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

    RenderableSoldier.prototype.isVisible = function (left, right, top, bottom)
    {
        return this.unit.tileX <= right &&
               this.unit.tileY <= bottom &&
               this.unit.tileX >= left &&
               this.unit.tileY >= top;
    };

    RenderableSoldier.prototype.onStateChange = function ()
    {
        this.spriteSheet.playAnimation(this.unit.state);
    };

    RenderableSoldier.prototype.onAnimationComplete = function (animation)
    {
        this.unit.trigger('animationComplete', animation.name);
        if (animation.name === 'death')
        {
            TransitionEffect.transitionFloat(null, this.style, 'opacity', null, 0.6, 1);
        }
    };

    RenderableSoldier.prototype.render = function (context, deltaTime, tileSize, viewportRect)
    {
        if (this.spriteSheet.image.isLoaded)
        {
            context.save();

            var halfTileSize = tileSize / 2;
            var xPosition = this.unit.tileX * tileSize - viewportRect.x + halfTileSize;
            var yPosition = this.unit.tileY * tileSize - viewportRect.y + halfTileSize;

            context.translate(xPosition, yPosition);
            if (this.unit.direction)
                context.rotate(this.unit.direction);

            this.spriteSheet.updateAnimation(deltaTime);
            var tileRect = this.spriteSheet.getCurrentTileBounds();

            if (this.isSelected)
            {
                context.beginPath();
                context.arc(0, 0, 25, 0, 2 * Math.PI);
                context.strokeStyle = this.unit.player.color;
                context.fillStyle = this.unit.player.color;

                context.stroke();

                context.globalAlpha = 0.1;
                context.fill();
                context.globalAlpha = 1;
            }

            context.globalAlpha = this.style.opacity;
            context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, -halfTileSize, -halfTileSize, tileSize, tileSize);
            context.globalAlpha = 1;

            context.restore();
        }
    };

    return RenderableSoldier;
});