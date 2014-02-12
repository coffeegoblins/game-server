define(['renderer', 'Core/src/scheduler', 'Core/src/inputHandler', 'Core/src/levelLoader', 'Core/src/turnManager',
        'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView', 'Core/src/attackManager',
        'Core/src/movementManager'],
    function (Renderer, Scheduler, InputHandler, LevelLoader, TurnManager, ActionBarView, ActiveUnitView, AttackManager, MovementManager)
    {
        'use strict';

        function PlotManager() { }

        PlotManager.prototype.initialize = function (weaponData)
        {
            this.weaponData = weaponData;

            LevelLoader.loadLevel("level1", weaponData, function (map, player)
            {
                this.currentMap = map;
                this.player = player;
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
            var attackActionName = activeUnit.type === 'archer' ? 'rangeAttack' : 'attack';
            ActionBarView.addActions([
                {id: 'move', method: this.movementManager.onMoveAction, context: this.movementManager},
                {id: attackActionName, method: this.attackManager.onAttackAction, context: this.attackManager},
                {id: 'endTurn', method: this.onEndTurnAction, context: this}
            ]);

            //if (activeUnit.player === this.player) TODO: Comment in to only be able to control your player
            {
                ActionBarView.showActions();
            }

            InputHandler.enableInput();
        };

        PlotManager.prototype.onEndTurn = function (activeUnit)
        {
            InputHandler.disableInput();
            ActionBarView.hideActions();
            Renderer.clearRenderablePaths();
            TurnManager.beginTurn();
        };

        PlotManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
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
