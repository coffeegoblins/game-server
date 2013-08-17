define(['renderer', 'Game/src/levelLoader'], function (Renderer, LevelLoader)
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

    CommandManager.moveViewport = function (x, y)
    {
        Renderer.viewportRect.x = x;
        Renderer.viewportRect.y = y;
    };

    window.CommandManager = CommandManager;
});