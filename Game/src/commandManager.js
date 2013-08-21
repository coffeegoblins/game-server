require(['renderer', './levelLoader', './turnManager'], function (Renderer, LevelLoader, TurnManager)
{
    'use strict';

    /**
     * @constructor
     */
    function CommandManager()
    {
        window.CommandManager = this;
    }

    CommandManager.moveActiveUnit = function (x, y)
    {
        LevelLoader.map.moveActiveUnit(x, y);
    };

    CommandManager.moveViewport = function (x, y, milliseconds)
    {
        Renderer.camera.moveViewport(x, y, milliseconds);
    };

    CommandManager.endTurn = function ()
    {
        TurnManager.endTurn();

        console.log(TurnManager.unitList);
    };

    window.CommandManager = CommandManager;
});