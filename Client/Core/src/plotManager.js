define([
        'renderer',
        'Core/src/scheduler',
        'Core/src/inputHandler',
        'Core/src/levelLoader',
        'Core/src/turnManager',
        'Renderer/src/ui/actionBarView',
        'Renderer/src/ui/activeUnitView',
        'Renderer/src/ui/renderableTurnQueue',
        'Core/src/attackManager',
        'Core/src/movementManager'
    ],
    function (Renderer, Scheduler, InputHandler, LevelLoader, TurnManager, ActionBarView, ActiveUnitView, RenderableTurnQueue, AttackManager, MovementManager)
    {
        'use strict';

        function PlotManager() { }

        PlotManager.prototype.initialize = function (weaponData)
        {
            this.weaponData = weaponData;

            LevelLoader.loadLevel('level1', weaponData, function (map, soldiers)
            {
                this.currentMap = map;
                this.currentMap.on('tileClick', this, this.onTileSelected);

                this.actionBarView = new ActionBarView(document.getElementById('actionBarView'));
                this.activeUnitView = new ActiveUnitView(document.getElementById('activeUnitView'));
                this.renderableTurnQueue = new RenderableTurnQueue(document.getElementById('turnQueue'));

                for (var i = 0; i < soldiers.length; i++)
                {
                    var soldier = soldiers[i];
                    TurnManager.addUnit(soldier);
                    this.renderableTurnQueue.addUnit(soldier);
                }

                // TODO Determine local player properly
                this.player = TurnManager.unitList[0].player;

                this.attackManager = new AttackManager(this.currentMap, this.actionBarView, this.activeUnitView);
                this.movementManager = new MovementManager(this.currentMap, this.actionBarView, this.activeUnitView);

                TurnManager.on('beginTurn', this.activeUnitView, this.activeUnitView.onBeginTurn);
                TurnManager.on('endTurn', this.activeUnitView, this.activeUnitView.onEndTurn);

                TurnManager.on('beginTurn', this.attackManager, this.attackManager.onBeginTurn);

                TurnManager.on('beginTurn', this, this.onBeginTurn);
                TurnManager.on('endTurn', this, this.onEndTurn);

                TurnManager.on('beginTurn', this.renderableTurnQueue, this.renderableTurnQueue.onBeginTurn);
                TurnManager.on('endTurn', this.renderableTurnQueue, this.renderableTurnQueue.onEndTurn);

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
            this.actionBarView.addActions([
                {id: 'move', method: this.movementManager.onMoveAction, context: this.movementManager},
                {id: attackActionName, method: this.attackManager.onAttackAction, context: this.attackManager},
                {id: 'endTurn', method: this.onEndTurnAction, context: this}
            ]);

            //if (activeUnit.player === this.player) TODO: Comment in to only be able to control your player
            {
                this.actionBarView.showActions();
            }

            InputHandler.enableInput();
        };

        PlotManager.prototype.onEndTurn = function ()
        {
            InputHandler.disableInput();
            this.actionBarView.hideActions();
            Renderer.clearRenderablePaths();
            TurnManager.beginTurn();
        };

        PlotManager.prototype.onTileSelected = function (tile)
        {
            this.activeUnitView.previewAP(0);
            Renderer.clearRenderablePathById('selectedPath');

            if (tile.content)
            {
                if (!tile.content.isClimbable || !TurnManager.activeUnit.canClimbObjects)
                {
                    // TODO Content logic, Show action
                }
            }

            if (tile.unit)
            {

            }
        };

        PlotManager.prototype.onEndTurnAction = function ()
        {
            TurnManager.endTurn();
        };

        return new PlotManager();
    });
