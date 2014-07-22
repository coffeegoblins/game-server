define(['Editor'], function (Editor)
{
    'use strict';

    var spriteSheets = {
        small: new Editor.SpriteSheet({tileWidth: 70, tileHeight: 70}),
        medium: new Editor.SpriteSheet({tileWidth: 96, tileHeight: 96}),
        large: new Editor.SpriteSheet({tileWidth: 128, tileHeight: 128})
    };

    spriteSheets.small.setImage(Editor.ImageCache.setImage('smallObjects', 'resources/objects-small.png'));
    spriteSheets.medium.setImage(Editor.ImageCache.setImage('mediumObjects', 'resources/objects-medium.png'));
    spriteSheets.large.setImage(Editor.ImageCache.setImage('largeObjects', 'resources/objects-large.png'));


    function DefaultObject() { }

    DefaultObject.prototype.initialize = function (x, y)
    {
        this.position = {x: Math.floor(x / 96), y: Math.floor(y / 96)};
        this.rect = new Rectangle(this.position.x * 96, this.position.y * 96, 96, 96);
    };

    DefaultObject.prototype.draw = function (viewport)
    {
        var spriteSheet = spriteSheets[this.size];
        if (spriteSheet && spriteSheet.image.isLoaded && this.style != null)
        {
            spriteSheet.setCurrentTile(this.style);
            viewport.renderer.drawSpriteSheet(viewport, spriteSheet, this.rect);
        }
        else
        {
            viewport.renderer.drawRectangle(viewport, this.rect);
            viewport.context.strokeStyle = '#cdcdcd';
            viewport.context.stroke();
        }
    };

    DefaultObject.prototype.getPropertyConfig = function ()
    {
        return {exclude: {'rect': true, 'typeName': true}};
    };

    DefaultObject.prototype.onPropertyChanged = function (property, propertyValue)
    {
        if (property.key === 'position')
        {
            this.rect.setPosition(this.position.x * 96, this.position.y * 96);
        }
        else if (property.key === ' size')
        {
            if (propertyValue === 'large')
                this.rect.setSize(192, 192);
            else
                this.rect.setSize(96, 96);
        }
    };

    DefaultObject.prototype.setPosition = function (x, y)
    {
        this.position.x = Math.floor(x / 96);
        this.position.y = Math.floor(y / 96);
        this.rect.setPosition(this.position.x * 96, this.position.y * 96);
    };


    DefaultObject.prototype.deserialize = function (data)
    {
        this.position = {x: data.x, y: data.y};

        var size = (data.size === 'large') ? 192 : 96;
        this.rect = new Rectangle(this.position.x * 96, this.position.y * 96, size, size);

        delete data.x;
        delete data.y;

        Utility.merge(this, data);
    };

    DefaultObject.prototype.serialize = function ()
    {
        var obj = Utility.merge({}, this);
        obj.x = obj.position.x;
        obj.y = obj.position.y;

        delete obj.position;
        delete obj.rect;
        return obj;
    };


    function Soldier()
    {
        DefaultObject.apply(this, arguments);
    }

    Soldier.prototype = Object.create(DefaultObject.prototype);
    Soldier.prototype.constructor = Soldier;

    Soldier.prototype.draw = function (viewport)
    {
        viewport.renderer.drawRectangle(viewport, this.rect);
        viewport.context.strokeStyle = '#cdcdcd';
        viewport.context.stroke();
    };


    return {
        object: DefaultObject,
        soldier: Soldier
    };
});