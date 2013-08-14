define([], function ()
{
    'use strict';

    /**
     * @constructor
     */
    function Soldier()
    {
        this.PositionX = 0;
        this.PositionY = 0;
    }

    Soldier.prototype.move = function (x, y)
    {
        // TODO Animate
        this.PositionX = x;
        this.PositionY = y;
    };

    /**
     *
     */

    return Soldier;
});