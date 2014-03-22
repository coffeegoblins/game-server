define(['renderer', 'Core/src/plotManager', 'Core/src/soundManager', 'Core/src/pathManager'],
    function (Renderer, PlotManager, SoundManager, PathManager)
    {
        'use strict';

        function CommandManager() { }

        CommandManager.endTurn = function ()
        {
            PlotManager.turnManager.endTurn();
        };

        CommandManager.getAvailableTiles = function ()
        {
            return PathManager.calculateAvailableTiles(PlotManager.currentMap, PlotManager.turnManager.activeUnit);
        };

        CommandManager.moveViewport = function (x, y, milliseconds)
        {
            Renderer.camera.moveViewport(x, y, milliseconds);
        };

        CommandManager.playTrack = function (trackName)
        {
            SoundManager.playTrack(trackName);
        };

        CommandManager.stopTrack = function (trackName)
        {
            SoundManager.stopTrack(trackName);
        };

        CommandManager.setActiveUnitAP = function (ap)
        {
            PlotManager.turnManager.activeUnit.ap = ap;
        };

        CommandManager.setAnimation = function (state)
        {
            PlotManager.turnManager.activeUnit.setState(state);
        };

        CommandManager.setDirection = function (x, y)
        {
            PlotManager.turnManager.activeUnit.setDirection(x, y);
        };

        window.CommandManager = CommandManager;
        return CommandManager;
    });