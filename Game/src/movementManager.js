define(['renderer', 'Game/src/scheduler', 'Game/src/pathManager', 'Game/src/turnManager', 'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView', 'Game/src/inputHandler', 'Game/src/Utility'],
    function (Renderer, Scheduler, PathManager, TurnManager, ActionBarView, ActiveUnitView, InputHandler, Utility)
    {
        'use strict';

        function MovementManager(currentMap, activeUnitView)
        {
            this.path = [];

            this.currentMap = currentMap;
            this.currentMap.registerTileClickedEvent('moveManager', this.onTileSelected, this);
            this.activeUnitView = activeUnitView;

            this.actionBarSnapshot = [];
        }

        MovementManager.prototype.onMoveAction = function ()
        {
            Renderer.clearRenderablePaths();

            this.path = PathManager.calculateAvailableTiles(this.currentMap,
                TurnManager.activeUnit.tileX,
                TurnManager.activeUnit.tileY,
                TurnManager.activeUnit.ap,
                TurnManager.activeUnit.maxMoveableHeight,
                false);

            Renderer.addRenderablePath('moveTiles', this.path, false);
        };

        MovementManager.prototype.onTileSelected = function(selectedTile, tileX, tileY)
        {
            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            if (!this.path)
                return;

            if (!Utility.containsElementWithProperty(this.path, 'tile', selectedTile))
                return;

            this.activePath = PathManager.calculatePath(this.path, TurnManager.activeUnit.tileX, TurnManager.activeUnit.tileY, tileX, tileY);
            if (this.activePath)
            {
                // Save the current action bar state
                this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

                ActionBarView.removeAllActions();
                ActionBarView.addActions([
                    {id: 'Cancel', method: this.onMoveCancelled, context: this},
                    {id: 'Move', method: this.onMoveConfirmed, context: this}
                ]);

                this.selectedTileCost = this.activePath[this.activePath.length - 1].distance;
                this.activeUnitView.previewAP(this.selectedTileCost);

                Renderer.addRenderablePath('selectedPath', this.activePath, true);
            }

            this.selectedTile = selectedTile;
        };

        MovementManager.prototype.onMoveCancelled = function ()
        {
            Renderer.clearRenderablePathById('selectedPath');
            this.revertActionBar();
        };

        MovementManager.prototype.onMoveConfirmed = function ()
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
                completedMethod: function (e)
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

            this.path = null;

            Renderer.clearRenderablePaths();

            while (this.actionBarSnapshot.length > 0)
                this.revertActionBar();
        };

        MovementManager.prototype.revertActionBar = function ()
        {
            ActionBarView.removeAllActions();
            ActionBarView.addActions(this.actionBarSnapshot.pop());
        };

        return MovementManager;
    });
