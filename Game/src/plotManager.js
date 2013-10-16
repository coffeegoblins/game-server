define(['renderer', 'Game/src/scheduler', 'Game/src/inputHandler', 'Game/src/levelLoader', 'Game/src/turnManager',
        'Game/src/pathManager', 'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView', 'Game/src/attackManager',
        'Game/src/movementManager'],
    function (Renderer, Scheduler, InputHandler, LevelLoader, TurnManager, PathManager, ActionBarView, ActiveUnitView, AttackManager, MovementManager)
    {
        'use strict';

        function PlotManager() { }

        PlotManager.prototype.initialize = function ()
        {
            LevelLoader.loadLevel("level1", function (map)
            {
                this.currentMap = map;
                this.currentMap.registerTileClickedEvent('plotManager', this.onTileSelected, this);

                this.activeUnitView = new ActiveUnitView();
                this.attackManager = new AttackManager(this.currentMap, this.activeUnitView);
                this.movementManager = new MovementManager(this.currentMap, this.activeUnitView);

                TurnManager.registerBeginTurnEvent('activeUnitView', this.activeUnitView.onBeginTurn, this.activeUnitView);
                TurnManager.registerEndTurnEvent('activeUnitView', this.activeUnitView.onEndTurn, this.activeUnitView);

                TurnManager.registerBeginTurnEvent('plotManager', this.onBeginTurn, this);
                TurnManager.registerEndTurnEvent('plotManager', this.onEndTurn, this);

                TurnManager.beginTurn();
            }.bind(this));
        };

        PlotManager.prototype.onBeginTurn = function (activeUnit)
        {
            Renderer.camera.moveToUnit(activeUnit, this, this.onCameraMoved);
        };

        PlotManager.prototype.onCameraMoved = function (activeUnit)
        {
            Renderer.blinkUnit(activeUnit, 1.5);

            ActionBarView.addActions([
                {id: 'EndTurn', method: this.onEndTurnAction, context: this},
                {id: 'Move', method: this.movementManager.onMoveAction, context: this.movementManager},
                {id: 'Attack', method: this.attackManager.onAttackAction, context: this.attackManager}
            ]);
            ActionBarView.showActions();
            InputHandler.enableInput();
        };

        PlotManager.prototype.onEndTurn = function (activeUnit)
        {
            InputHandler.disableInput();
            Renderer.stopBlinkUnit(activeUnit);

            ActionBarView.hideActions();

            Renderer.clearRenderablePaths();

            TurnManager.beginTurn();
        };

        PlotManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
            this.selectedTile = selectedTile;
            this.activeUnitView.previewAP(0);
            Renderer.clearRenderablePathById('selectedPath');

            if (selectedTile.content)
            {
                if (!selectedTile.content.isClimbable || !TurnManager.activeUnit.canClimbObjects)
                {
                    // TODO Content logic, Show action
                    return;
                }
            }
        };

        PlotManager.prototype.onEndTurnAction = function ()
        {
            TurnManager.endTurn();
        };

        return new PlotManager();
    });