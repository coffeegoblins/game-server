define(['Core/src/imageCache', 'Core/src/spriteSheet', './effects/transitionEffect', 'text!../content/animations.json'], function (ImageCache, SpriteSheet, TransitionEffect, AnimationDefinitions)
{
    'use strict';

    var animations = JSON.parse(AnimationDefinitions);

    function RenderableSoldier(unit)
    {
        this.unit = unit;
        this.style = {opacity: 1};

        this.spriteSheet = createSpriteSheet(this.unit.weapon.type);
        this.spriteSheet.playAnimation(this.unit.state);
        this.spriteSheet.on('animationComplete', this, this.onAnimationComplete);

        this.unit.on('stateChange', this.onStateChange.bind(this));
    }

    function createSpriteSheet(type)
    {
        var animationDefinition = animations[type];
        var spriteSheet = new SpriteSheet(animationDefinition.spriteSheet, 'Renderer/content/images/' + animationDefinition.spriteSheet + '.png', {
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

    RenderableSoldier.prototype.getSelectionColor = function ()
    {
        if (this.unit.isSelected)
        {
            if (this.unit.player.isLocal)
                return '#3ddb11';

            return '#f93b34';
        }

        if (this.unit.isTargeted)
            return '#a0a0a0';
    };

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
            TransitionEffect.transitionFloat({
                source: this.style,
                property: 'opacity',
                targetValue: 0.6
            });
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

            var color = this.getSelectionColor();
            if (color)
            {
                context.beginPath();
                context.arc(0, 0, 30, 0, 2 * Math.PI);

                if (this.unit.player.isLocal)
                {
                    context.strokeStyle = color;
                    context.fillStyle = color;
                }
                else
                {
                    context.strokeStyle = color;
                    context.fillStyle = color;
                }

                context.globalAlpha = 0.3;
                context.fill();
                context.globalAlpha = 0.75;
                context.stroke();
            }

            if (this.unit.direction)
                context.rotate(this.unit.direction);

            this.spriteSheet.updateAnimation(deltaTime);
            context.globalAlpha = this.style.opacity;

            var tileRect = this.spriteSheet.getCurrentTileBounds();
            if (tileRect)
            {
                context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, -halfTileSize, -halfTileSize, tileSize, tileSize);
            }

            context.restore();
        }
    };

    return RenderableSoldier;
});
