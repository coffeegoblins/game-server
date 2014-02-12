define(function ()
{
    'use strict';

    function DefaultObject() { }

    DefaultObject.prototype.initialize = function (x, y)
    {
        this.position = {x: Math.floor(x / 64), y: Math.floor(y / 64)};
        this.rect = {x: this.position.x * 64, y: this.position.y * 64, width: 64, height: 64};
    };

    DefaultObject.prototype.draw = function (viewport)
    {
        viewport.context.strokeStyle = '#cdcdcd';

        var x = Math.floor((this.rect.x - viewport.rect.left) * viewport.scale);
        var y = Math.floor((this.rect.y - viewport.rect.top) * viewport.scale);
        var width = Math.floor(this.rect.width * viewport.scale);
        var height = Math.floor(this.rect.height * viewport.scale);

        viewport.context.beginPath();
        viewport.context.rect(x, y, width, height);
        viewport.context.stroke();
    };

    DefaultObject.prototype.getPropertyConfig = function ()
    {
        return {exclude: {'rect': true, 'typeName': true}};
    };

    DefaultObject.prototype.onPropertyChanged = function (property, propertyValue)
    {
        if (property.key === 'position')
        {
            this.rect.x = this.position.x * 64;
            this.rect.y = this.position.y * 64;
        }
    };

    DefaultObject.prototype.deserialize = function (data)
    {
        this.initialize(data.x * 64, data.y * 64);

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

    return {
        object: DefaultObject,
        soldier: Soldier
    };
});