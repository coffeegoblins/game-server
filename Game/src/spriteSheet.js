define(['./imageCache', './utility'], function (ImageCache, Utility)
{
    'use strict';

    var defaults = {
        animationSpeed: 0.05,
        tileWidth: 64,
        tileHeight: 64
    };

    function SpriteSheet(id, path, properties)
    {
        this.animations = [];
        this.currentTile = 0;
        this.image = ImageCache.loadImage(id, path);
        Utility.merge(this, defaults, properties);
    }

    SpriteSheet.prototype.defineAnimation = function (name, startIndex, endIndex)
    {
        this.animations[name] = {
            start: startIndex,
            end: endIndex,
            frameCount: 1 + endIndex - startIndex
        };
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

    SpriteSheet.prototype.playAnimation = function (name, speed)
    {
        this.currentAnimation = this.animations[name];
        this.currentAnimation.time = 0;
        this.currentTile = this.currentAnimation.start;
        this.currentAnimation.length = (speed || this.animationSpeed) * this.currentAnimation.frameCount;
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
        if (this.currentAnimation)
        {
            this.currentAnimation.time += deltaTime;
            if (this.currentAnimation.time > this.currentAnimation.length)
                this.currentAnimation.time -= this.currentAnimation.length;

            var animationFrame = Math.floor(this.currentAnimation.frameCount * (this.currentAnimation.time / this.currentAnimation.length));
            this.setCurrentTile(this.currentAnimation.start + animationFrame);
        }
    };

    return SpriteSheet;
});