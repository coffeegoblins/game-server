define(['Game/src/levelLoader', 'Game/src/turnManager'], function (LevelLoader, TurnManager)
{
    'use strict';

    /**
     * @constructor
     */
    function CommandManager()
    {
        window.CommandManager = this;
    }

    CommandManager.prototype.moveActiveUnit = function(x, y)
    {
        LevelLoader.map.moveActiveUnit(x, y);
    }

    CommandManager.prototype.endTurn = function()
    {
        TurnManager.endTurn();
    }

    CommandManager.prototype.printTurnQueue = function()
    {
        console.log(TurnManager.unitList);
    }

    return new CommandManager;
});