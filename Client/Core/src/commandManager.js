define(['renderer', 'Core/src/levelLoader', 'Core/src/soundManager', 'Core/src/turnManager', 'Core/src/pathManager'],
    function (Renderer, LevelLoader, SoundManager, TurnManager, PathManager)
    {
        'use strict';

        function CommandManager() { }

        CommandManager.endTurn = function ()
        {
            TurnManager.endTurn();
        };

        CommandManager.getAvailableTiles = function ()
        {
            PathManager.calculateAvailableTiles(LevelLoader.map, TurnManager.activeUnit);
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
            TurnManager.activeUnit.ap = ap;
        };

        CommandManager.setAnimation = function (state)
        {
            TurnManager.activeUnit.setState(state);
        };

        CommandManager.setDirection = function (x, y)
        {
            TurnManager.activeUnit.setDirection(x, y);
        };

        window.CommandManager = CommandManager;

        return CommandManager;
    });
