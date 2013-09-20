define(['renderer', 'Game/src/levelLoader', 'Game/src/turnManager', 'Game/src/pathManager', 'Renderer/src/effects/transitionEffect', 'Renderer/src/effects/blinkEffect'],
    function (Renderer, LevelLoader, TurnManager, PathManager, TransitionEffect, BlinkEffect)
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
        };

        CommandManager.getAvailableTiles = function ()
        {
            PathManager.calculateAvailableTiles(LevelLoader.map, TurnManager.activeUnit);
        };

        CommandManager.transitionEffect = function (control, styleName, suffix, targetValue, seconds)
        {
            TransitionEffect.transitionFloat(control, styleName, suffix, targetValue, seconds);
        };

        CommandManager.blinkEffect = function (control, seconds)
        {
            BlinkEffect.blink(control, seconds);
        };

        CommandManager.stopBlinkEffect = function (control)
        {
            BlinkEffect.stopBlink(control);
        };

        CommandManager.setActiveUnitAP = function (ap)
        {
            TurnManager.activeUnit.ap = ap;
        };

        window.CommandManager = CommandManager;

        return CommandManager;
    });