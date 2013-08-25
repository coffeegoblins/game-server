define(['Game/src/worldObject'], function (WorldObject)
{
    'use strict';

    function ClimbableWorldObject(sizeX, sizeY)
    {
        WorldObject.call(this, sizeX, sizeY);
    }

    ClimbableWorldObject.prototype = Object.create(WorldObject.prototype);
    ClimbableWorldObject.prototype.constructor = WorldObject;
    ClimbableWorldObject.prototype.parent = WorldObject.prototype;

    return ClimbableWorldObject;
});