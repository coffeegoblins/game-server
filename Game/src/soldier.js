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
        this.ap = 42;
        this.maxAP = 42;
    }

    return Soldier;
});