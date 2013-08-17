define(['Game/src/levelLoader'], function (LevelLoader)
{
    'use strict';

    /**
     * @constructor
     */
    function CommandManager()
    {
        window.CommandManager = this;
    }

    // TODO Add functions as needed
    CommandManager.prototype.moveUnit = function(x, y, x2, y2)
    {
        LevelLoader.map.moveUnit(x, y, x2, y2);
    }

    return new CommandManager;
});