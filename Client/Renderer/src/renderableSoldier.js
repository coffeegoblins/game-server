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

    RenderableSoldier.prototype.render = function (context, deltaTime, camera)
    {
        if (!this.spriteSheet.image.isLoaded)
            return;

        context.save();

        var position = camera.tileToScreen(this.unit.tileX, this.unit.tileY);
        context.translate(position.x + camera.halfTileWidth - camera.viewportRect.x, position.y+camera.halfTileHeight - camera.viewportRect.y);

        var color = this.getSelectionColor();
        if (color)
        {
            var width = camera.tileWidth * 2 / 3;
            var height = camera.tileHeight * 2 / 3;
            drawEllipse(context, -width / 2, -height / 2, width, height);

            context.strokeStyle = color;
            context.fillStyle = color;

            context.globalAlpha = 0.3;
            context.fill();
            context.globalAlpha = 0.75;
            context.stroke();
        }

        if (this.unit.direction)
            context.rotate(this.unit.direction);

        this.spriteSheet.updateAnimation(deltaTime);
        var tileRect = this.spriteSheet.getCurrentTileBounds();
        if (tileRect)
        {
            var imageWidth = this.spriteSheet.tileWidth * camera.scale;
            var imageHeight = this.spriteSheet.tileHeight * camera.scale;

            context.globalAlpha = this.style.opacity;
            context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height,
                    -imageWidth / 2, -imageHeight / 2, imageWidth, imageHeight);
        }

        context.restore();
    };

    function drawEllipse(context, left, top, width, height)
    {
        var horizontalOffset = (width / 2) * 0.5522848;
        var verticalOffset = (height / 2) * 0.5522848;
        var right = left + width;
        var bottom = top + height;
        var xCenter = left + width / 2;
        var yCenter = top + height / 2;

        context.beginPath();
        context.moveTo(left, yCenter);
        context.bezierCurveTo(left, yCenter - verticalOffset, xCenter - horizontalOffset, top, xCenter, top);
        context.bezierCurveTo(xCenter + horizontalOffset, top, right, yCenter - verticalOffset, right, yCenter);
        context.bezierCurveTo(right, yCenter + verticalOffset, xCenter + horizontalOffset, bottom, xCenter, bottom);
        context.bezierCurveTo(xCenter - horizontalOffset, bottom, left, yCenter + verticalOffset, left, yCenter);
        context.closePath();
    }

    return RenderableSoldier;
});
