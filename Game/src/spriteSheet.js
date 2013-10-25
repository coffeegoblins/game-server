define(['./imageCache', './utility'], function (ImageCache, Utility)
{
    'use strict';

    var defaults = {
        tileWidth: 64,
        tileHeight: 64
    };

    function SpriteSheet(id, path, properties)
    {
        this.animations = {};
        this.currentTile = 0;
        this.image = ImageCache.loadImage(id, path);
        Utility.merge(this, defaults, properties);
    }

    SpriteSheet.prototype.defineAnimation = function (name, properties)
    {
        if (!properties.frames)
            properties.frames = {};

        this.animations[name] = properties;
    };

    SpriteSheet.prototype.getCurrentTileBounds = function ()
    {
        if (!this.currentTileBounds)
            this.currentTileBounds = this.getTileBounds(this.currentTile);

        return this.currentTileBounds;
    };

    SpriteSheet.prototype.getTileBounds = function (tileIndex)
    {
        if (this.image.isLoaded)
        {
            var tilesPerRow = Math.floor(this.image.width / this.tileWidth);
            var horizontalOffset = (tileIndex % tilesPerRow) * this.tileWidth;
            var verticalOffset = Math.floor(tileIndex / tilesPerRow) * this.tileHeight;

            return {
                x: horizontalOffset,
                y: verticalOffset,
                width: this.tileWidth,
                height: this.tileHeight
            };
        }
    };

    SpriteSheet.prototype.playAnimation = function (name)
    {
        this.currentAnimation = this.animations[name];
        this.currentTile = this.currentAnimation.start;
        this.animationTime = 0;
    };

    SpriteSheet.prototype.setCurrentTile = function (index)
    {
        if (this.currentTile !== index)
        {
            this.currentTile = index;
            this.currentTileBounds = null;
        }
    };

    SpriteSheet.prototype.stopAnimation = function ()
    {
        this.currentAnimation = null;
    };

    SpriteSheet.prototype.updateAnimation = function (deltaTime)
    {
        if (!this.currentAnimation)
            return;

        var frameTime = 0;
        this.animationTime += deltaTime;

        for (var i = this.currentAnimation.start; i <= this.currentAnimation.end; i++)
        {
            if (this.currentAnimation.frames[i] != null)
                frameTime += this.currentAnimation.frames[i];
            else
                frameTime += this.currentAnimation.speed;

            if (this.animationTime < frameTime)
            {
                this.setCurrentTile(i);
                return;
            }
        }

        this.animationTime -= frameTime;
        this.setCurrentTile(this.currentAnimation.start);
    };

    return SpriteSheet;
});