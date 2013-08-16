require(['renderer', 'Game/src/levelLoader'], function (Renderer, LevelLoader)
{
    'use strict';

    function CommandManager()
    {
    }

    // TODO Add functions as needed

    CommandManager.moveUnit = function (x, y, x2, y2)
    {
        LevelLoader.map.moveUnit(x, y, x2, y2);
    };

    CommandManager.moveViewport = function (x, y)
    {
        Renderer.viewportRect.x = x;
        Renderer.viewportRect.y = y;
    };

    window.CommandManager = CommandManager;
});