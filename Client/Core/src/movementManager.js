define(['renderer', 'Core/src/scheduler', 'Core/src/pathManager', 'Core/src/turnManager', 'Core/src/inputHandler', 'Core/src/utility'],
    function (Renderer, Scheduler, PathManager, TurnManager, InputHandler, Utility)
    {
        'use strict';

        function MovementManager(currentMap, actionBarView, activeUnitView)
        {
            this.actionBarSnapshot = [];

            this.currentMap = currentMap;
            this.actionBarView = actionBarView;
            this.activeUnitView = activeUnitView;
        }

        MovementManager.prototype.onMoveAction = function ()
        {
            // Save the current action bar state
            this.actionBarSnapshot.push(this.actionBarView.actionsList.slice(0));

            this.actionBarView.removeAllActions();
            this.actionBarView.addActions([
                {id: 'cancel', method: this.onMoveActionCancelled, context: this}
            ]);

            this.availableMoveTiles = PathManager.calculateAvailableTiles(this.currentMap, {
                x: TurnManager.activeUnit.tileX,
                y: TurnManager.activeUnit.tileY,
                maxDistance: TurnManager.activeUnit.ap,
                maxClimbableHeight: TurnManager.activeUnit.maxMoveableHeight
            });

            Renderer.clearRenderablePaths();
            Renderer.addRenderablePath('moveTiles', this.availableMoveTiles, false);

            this.currentMap.on('tileClick', this, this.onTileSelected);
        };

        MovementManager.prototype.onMoveActionCancelled = function ()
        {
            this.currentMap.off('tileClick', this, this.onTileSelected);

            Renderer.clearRenderablePaths();

            this.selectedPath = null;
            this.activeUnitView.previewAP(0);
            this.availableMoveTiles = null;
            this.selectedTileCost = null;

            this.revertActionBar();
        };

        MovementManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
            if (selectedTile.unit != null)
                return; // Clicked on active unit

            if (!Utility.getElementByProperty(this.availableMoveTiles, 'tile', selectedTile) && this.selectedPath != null)
            {
                this.selectedPath = null;
                this.activeUnitView.previewAP(0);

                this.actionBarView.removeActionById('Move');
                return;
            }

            this.selectedPath = PathManager.calculatePathFromNodes(this.availableMoveTiles, TurnManager.activeUnit.tileX, TurnManager.activeUnit.tileY, tileX, tileY);
            if (this.selectedPath)
            {
                this.actionBarView.addActions([
                    {id: 'confirmMove', method: this.onMoveConfirmed, context: this}
                ]);

                this.selectedTileCost = this.selectedPath[this.selectedPath.length - 1].distance;
                this.activeUnitView.previewAP(this.selectedTileCost);

                Renderer.addRenderablePath('selectedPath', this.selectedPath, true);
            }
        };

        MovementManager.prototype.onMoveConfirmed = function ()
        {
            InputHandler.disableInput();

            var unit = TurnManager.activeUnit;
            unit.setState('run');

            var startTile = this.currentMap.getTile(unit.tileX, unit.tileY);
            startTile.unit = null;

            var startAp = unit.ap;
            var endAp = startAp - this.selectedTileCost;
            var progressTime = 0;
            var totalTime = this.selectedTileCost / 35;

            var path = this.selectedPath.slice();
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

                    var deltaX = nextNode.x - currentNode.x;
                    var deltaY = nextNode.y - currentNode.y;
                    unit.setDirection(deltaX, deltaY);

                    var nodeProgressPercentage = (progressPercentage - nextNode.startPercentage) / nextNode.percentageShare;
                    unit.tileX = currentNode.x + (deltaX * nodeProgressPercentage);
                    unit.tileY = currentNode.y + (deltaY * nodeProgressPercentage);

                    unit.ap = startAp + (endAp - startAp) * progressPercentage;
                    this.activeUnitView.setAP(unit.ap, unit.maxAP);
                },
                completedMethod: function ()
                {
                    unit.tileX = nextNode.x;
                    unit.tileY = nextNode.y;
                    nextNode.tile.unit = unit;

                    unit.ap = endAp;
                    unit.setState('idle');
                    this.activeUnitView.setAP(unit.ap, unit.maxAP);

                    InputHandler.enableInput();
                    this.currentMap.off('tileClick', this, this.onTileSelected);
                }
            });

            this.availableMoveTiles = null;
            this.selectedPath = null;
            this.activeUnitView.previewAP(0);
            this.selectedTileCost = null;

            Renderer.clearRenderablePaths();

            while (this.actionBarSnapshot.length > 0)
                this.revertActionBar();
        };

        MovementManager.prototype.revertActionBar = function ()
        {
            this.actionBarView.removeAllActions();
            this.actionBarView.addActions(this.actionBarSnapshot.pop());
        };

        return MovementManager;
    });
