define(['./imageCache', './utility'], function (ImageCache, Utility)
{
    'use strict';
    var defaultOptions = {
        tileWidth: 64,
        tileHeight: 64
    };

    function SpriteSheet(id, path, properties)
    {
        this.image = ImageCache.loadImage(id, path);
        Utility.merge(this, defaultOptions, properties);
    }

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

    return SpriteSheet;
});