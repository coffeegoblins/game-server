define(function ()
{
    'use strict';

    /**
     * @constructor
     */
    function Soldier()
    {
        this.CurrentTile = null;
        this.Name = "";
        this.x = 0;
        this.y = 0;
        this.MOV = 10;
        this.TotalMOV = 10;
    }

    Soldier.prototype.move = function (targetTile)
    {
        if(this.CurrentTile != null)
        {
            this.CurrentTile.unit = null;
        }

        // TODO Animate
        this.CurrentTile = targetTile;

        this.x = targetTile.xPosition;
        this.y = targetTile.yPosition;

        targetTile.unit = this;
    };

    /**
     *
     */

    return Soldier;
});