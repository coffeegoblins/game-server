define(['renderer', 'Game/src/scheduler', 'Game/src/inputHandler', 'Game/src/levelLoader', 'Game/src/turnManager',
        'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView', 'Game/src/attackManager',
        'Game/src/movementManager'],
    function (Renderer, Scheduler, InputHandler, LevelLoader, TurnManager, ActionBarView, ActiveUnitView, AttackManager, MovementManager)
    {
        'use strict';

        function PlotManager() { }

        PlotManager.prototype.initialize = function ()
        {
            LevelLoader.loadLevel("level1", function (map)
            {
                this.currentMap = map;
                this.currentMap.on('tileClick', this, this.onTileSelected);

                this.activeUnitView = new ActiveUnitView();
                this.attackManager = new AttackManager(this.currentMap, this.activeUnitView);
                this.movementManager = new MovementManager(this.currentMap, this.activeUnitView);

                TurnManager.on('beginTurn', this.activeUnitView, this.activeUnitView.onBeginTurn);
                TurnManager.on('endTurn', this.activeUnitView, this.activeUnitView.onEndTurn);

                TurnManager.on('beginTurn', this.attackManager, this.attackManager.onBeginTurn);

                TurnManager.on('beginTurn', this, this.onBeginTurn);
                TurnManager.on('endTurn', this, this.onEndTurn);

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
                }
            }
        };

        PlotManager.prototype.onEndTurnAction = function ()
        {
            TurnManager.endTurn();
        };

        return new PlotManager();
    });