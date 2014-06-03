define(['Editor'], function (Editor)
{
    'use strict';

    var objectSpriteSheet = new Editor.SpriteSheet({tileWidth: 128, tileHeight: 128});
    objectSpriteSheet.setImage(Editor.ImageCache.loadImage('objects', 'resources/object.png'));


    function DefaultObject() { }

    DefaultObject.prototype.initialize = function (x, y)
    {
        this.position = {x: Math.floor(x / 96), y: Math.floor(y / 96)};
        this.rect = new Rectangle(this.position.x * 96, this.position.y * 96, 96, 96);
    };

    DefaultObject.prototype.draw = function (viewport)
    {
        if (objectSpriteSheet.image.isLoaded && this.style != null)
        {
            objectSpriteSheet.setCurrentTile(this.style);
            viewport.renderer.drawSpriteSheet(viewport, objectSpriteSheet, this.rect);
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
        this.rect = new Rectangle(this.position.x * 96, this.position.y * 96, 96, 96);

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