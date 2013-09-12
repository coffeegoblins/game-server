define(['Game/src/worldObject'], function (WorldObject)
{
    'use strict';

    function Ladder(direction, size)
    {
        this.direction = direction;
        this.isClimbable = true;

        var sizeX, sizeY;
        if (/left|right/.test(this.direction))
        {
            sizeX = size || 1;
            sizeY = 1;
        }
        else
        {
            sizeX = 1;
            sizeY = size || 1;
        }

        WorldObject.call(this, sizeX, sizeY);
    }

    Ladder.prototype = Object.create(WorldObject.prototype);
    Ladder.prototype.constructor = Ladder;

    return Ladder;
});