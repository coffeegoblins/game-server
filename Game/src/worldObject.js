define(['./utility'], function (Utility)
{
    'use strict';

    var defaults = {
        sizeX: 1,
        sizeY: 1
    };

    function WorldObject(properties)
    {
        Utility.merge(this, defaults, properties);
    }

    return WorldObject;
});