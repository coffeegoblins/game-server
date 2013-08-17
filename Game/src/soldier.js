define([], function ()
{
    'use strict';

    /**
     * @constructor
     */
    function Soldier()
    {
        this.CurrentTile = null;
        this.Name = "";
        this.MOV = 10;
        this.TotalMOV = 10;
    }

    Soldier.prototype.move = function (targetTile)
    {
        this.CurrentTile.unit = null;

        // TODO Animate
        this.CurrentTile = targetTile;

        targetTile.unit = this;
    };

    /**
     *
     */

    return Soldier;
});