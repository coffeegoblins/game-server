define(['renderer', 'Game/src/levelLoader', 'Game/src/turnManager', 'Game/src/pathManager'],
    function (Renderer, LevelLoader, TurnManager, PathManager)
{
    'use strict';

    /**
     * @constructor
     */
    function CommandManager()
    {
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

    CommandManager.getAvailableTiles = function()
    {
        PathManager.calculateAvailableTiles(LevelLoader.map, TurnManager.unitList[0]);

        console.log(LevelLoader.map);
    };

    CommandManager.setActiveUnitHP = function(hp, seconds)
    {
        TurnManager.unitList[0].hp = hp;
        TurnManager.activeUnitView.hpBar.transitionProgress(hp, seconds);
    };

    CommandManager.setActiveUnitAP = function(ap, seconds)
    {
        TurnManager.unitList[0].ap = ap;
        TurnManager.activeUnitView.apBar.transitionProgress(ap, seconds);
    };

    window.CommandManager = CommandManager;

    return CommandManager;
});