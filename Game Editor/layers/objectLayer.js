define(function ()
{
    'use strict';
    function ObjectLayer()
    {
        this.name = ObjectLayer.type;
        this.objectTypes = [];
    }

    ObjectLayer.prototype.getPanel = function ()
    {
        return document.createElement('div');//this.element;
    };

    ObjectLayer.prototype.serialize = function ()
    {

    };

    ObjectLayer.prototype.deserialize = function (data)
    {
    };


    ObjectLayer.type = 'Object Layer';
    return ObjectLayer;
});