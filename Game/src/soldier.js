define(function ()
{
    'use strict';

    /**
     * @constructor
     */
    function Soldier()
    {
        this.name = null;
        this.tileX = 0;
        this.tileY = 0;
        this.MOV = 10;
        this.totalMOV = 10;
    }

    Soldier.prototype.move = function (tile, x, y)
    {
        // TODO Animate

        this.tileX = x;
        this.tileY = y;
    };

    return Soldier;
});