define(['renderer', 'Game/src/scheduler', 'Game/src/inputHandler', 'Game/src/levelLoader', 'Game/src/turnManager', 'Game/src/pathManager', 'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView'],
    function (Renderer, Scheduler, InputHandler, LevelLoader, TurnManager, PathManager, ActionBarView, ActiveUnitView)
    {
        'use strict';

        function PlotManager() { }

        PlotManager.prototype.initialize = function ()
        {
            this.currentMap = LevelLoader.loadLevel("Level1");
            this.currentMap.registerTileClickedEvent("PlotManager", this.onTileSelected, this);

            this.activeUnitView = new ActiveUnitView();

            TurnManager.registerBeginTurnEvent("activeUnitView", this.activeUnitView.onBeginTurn, this.activeUnitView);
            TurnManager.registerEndTurnEvent("activeUnitView", this.activeUnitView.onEndTurn, this.activeUnitView);

            TurnManager.registerBeginTurnEvent("plotManager", this.onBeginTurn, this);
            TurnManager.registerEndTurnEvent("plotManager", this.onEndTurn, this);

            TurnManager.beginTurn();
        };

        PlotManager.prototype.onBeginTurn = function (activeUnit)
        {
            Renderer.camera.moveToUnit(activeUnit, this, this.onCameraMoved);
        };

        PlotManager.prototype.onCameraMoved = function (activeUnit)
        {
            Renderer.addRenderablePath("availableTiles", PathManager.calculateAvailableTiles(this.currentMap, activeUnit), false);
            Renderer.blinkUnit(activeUnit, 1.5);

            ActionBarView.addActions([
                {id: 'EndTurn', method: this.onEndTurnAction, context: this}
            ]);
            ActionBarView.showActions();
            InputHandler.enableInput();
        };

        PlotManager.prototype.onEndTurn = function (activeUnit)
        {
            InputHandler.disableInput();
            Renderer.stopBlinkUnit(activeUnit);

            // TODO Hide content and attack action
            ActionBarView.hideActions();
            ActionBarView.removeActions('Move', 'Attack');

            Renderer.clearRenderablePathById('availableTiles');
            Renderer.clearRenderablePathById('selectedPath');

            TurnManager.beginTurn();
        };

        PlotManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
            this.selectedTile = selectedTile;
            this.activeUnitView.previewAP(0);
            Renderer.clearRenderablePathById('selectedPath');

            // TODO Hide content and attack action
            ActionBarView.removeActions('Move', 'Attack');

            if (selectedTile.content)
            {
                if (!selectedTile.content.isClimbable || !TurnManager.activeUnit.canClimbObjects)
                {
                    // TODO Content logic, Show action
                    return;
                }
            }

            if (selectedTile.unit)
            {
                var distance = Math.sqrt(Math.pow(tileX - TurnManager.activeUnit.tileX, 2) + Math.pow(tileY - TurnManager.activeUnit.tileY, 2));

                if (distance < TurnManager.activeUnit.attackRange && TurnManager.activeUnit.ap >= TurnManager.activeUnit.attackCost)
                {
                    ActionBarView.addActions([
                        {id: 'Attack', method: this.onAttackAction, context: this}
                    ]);
                }
                return;
            }

            this.activePath = PathManager.calculatePath(this, TurnManager.activeUnit, tileX, tileY);
            if (this.activePath)
            {
                this.selectedTileCost = this.activePath[this.activePath.length - 1].distance;
                this.activeUnitView.previewAP(this.selectedTileCost);

                Renderer.addRenderablePath('selectedPath', this.activePath, true);
                ActionBarView.addActions([
                    {id: 'Move', method: this.onMoveAction, context: this}
                ]);
            }
        };

        PlotManager.prototype.onAttackAction = function ()
        {
            this.selectedTile.unit.hp -= TurnManager.activeUnit.attackPower;
            TurnManager.activeUnit.ap -= TurnManager.activeUnit.attackCost;
            this.activeUnitView.transitionProgress('AttackAction', TurnManager.activeUnit.ap, TurnManager.activeUnit.maxAP, 1);

            ActionBarView.removeActions('Attack');
        };

        PlotManager.prototype.onMoveAction = function ()
        {
            InputHandler.disableInput();

            var unit = TurnManager.activeUnit;
            var startTile = this.currentMap.getTile(unit.tileX, unit.tileY);
            startTile.unit = null;

            var startAp = unit.ap;
            var endAp = startAp - this.selectedTileCost;
            var progressTime = 0;
            var totalTime = this.selectedTileCost / 35;

            var path = this.activePath.slice();
            path.unshift({x: unit.tileX, y: unit.tileY});

            var progressPercentage = 0;
            for (var i = 1; i < path.length; i++)
            {
                var node = path[i];
                node.startPercentage = progressPercentage;
                node.endPercentage = node.distance / this.selectedTileCost;
                node.percentageShare = node.endPercentage - node.startPercentage;
                progressPercentage = node.endPercentage;
            }

            var currentNode = path.shift();
            var nextNode = path.shift();

            Scheduler.schedule({
                context: this,
                endTime: totalTime,
                method: function (e, deltaTime)
                {
                    progressTime += deltaTime;
                    var progressPercentage = progressTime / totalTime;
                    while (progressPercentage > nextNode.endPercentage)
                    {
                        currentNode = nextNode;
                        nextNode = path.shift();
                    }

                    var nodeProgressPercentage = (progressPercentage - nextNode.startPercentage) / nextNode.percentageShare;

                    unit.tileX = currentNode.x + ((nextNode.x - currentNode.x) * nodeProgressPercentage);
                    unit.tileY = currentNode.y + ((nextNode.y - currentNode.y) * nodeProgressPercentage);

                    unit.ap = startAp + (endAp - startAp) * progressPercentage;
                    this.activeUnitView.setAP(unit.ap, unit.maxAP);
                },
                completedMethod: function ()
                {
                    unit.tileX = nextNode.x;
                    unit.tileY = nextNode.y;
                    nextNode.tile.unit = unit;

                    unit.ap = endAp;
                    this.activeUnitView.setAP(unit.ap, unit.maxAP);

                    Renderer.addRenderablePath("availableTiles", PathManager.calculateAvailableTiles(this.currentMap, unit), false);
                    InputHandler.enableInput();
                }
            });

            ActionBarView.removeActions('Move');
            Renderer.clearRenderablePathById("availableTiles");
            Renderer.clearRenderablePathById("selectedPath");
        };

        PlotManager.prototype.onEndTurnAction = function ()
        {
            TurnManager.endTurn();
        };

        return new PlotManager();
    });