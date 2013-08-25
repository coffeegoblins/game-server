define(function ()
{
    'use strict';

    function WorldObject(sizeX, sizeY)
    {
        this.tileX = 0;
        this.tileY = 0;
        this.sizeX = sizeX || 1;
        this.sizeY = sizeY || 1;
    }

    return WorldObject;
});