define(['renderer', './inputHandler', './pathManager', 'Renderer/src/ui/actionBarView', './utility'],
    function (Renderer, InputHandler, PathManager, ActionBarView, Utility)
    {
        'use strict';

        function AttackManager(currentMap, activeUnitView)
        {
            this.actionBarSnapshot = [];
            this.availableAttackTiles = [];

            this.currentMap = currentMap;
            this.activeUnitView = activeUnitView;
        }

        AttackManager.prototype.onBeginTurn = function (activeUnit)
        {
            this.activeUnit = activeUnit;
        };

        AttackManager.prototype.onAttackAction = function ()
        {
            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));
            ActionBarView.removeAllActions();

            var actions = [];
            switch (this.activeUnit.weapon.type)
            {
                case 'archer':
                    actions.push({id: 'shortShot', method: this.onShortShotAction, context: this});
                    actions.push({id: 'longShot', method: this.onLongShotAction, context: this});
                    break;

                case 'swordAndShield':
                    actions.push({id: 'strike', method: this.onStrikeAction, context: this});
                    actions.push({id: 'shield', method: this.onShieldBash, context: this});
                    break;

                case 'twoHanded':
                    actions.push({id: 'strike', method: this.onStrikeAction, context: this});
                    actions.push({id: 'sweep', method: this.onSweepAction, context: this});
                    break;

                case 'dualWield':
                    actions.push({id: 'strike', method: this.onStrikeAction, context: this});
                    break;
            }

            actions.push({id: 'cancel', method: this.onAttackActionCancelled, context: this});
            ActionBarView.addActions(actions);
        };

        AttackManager.prototype.onAttackActionCancelled = function ()
        {
            Renderer.clearRenderablePaths();
            this.revertActionBar();

            this.selectedNode = null;
            this.currentMap.off('tileClick', this, this.onTileSelected);
        };


        AttackManager.prototype.onShieldBash = function ()
        {
            this.onActionSelected({ maxDistance: Math.min(this.activeUnit.weapon.range, PathManager.defaultMoveCost) });
        };

        AttackManager.prototype.onStrikeAction = function ()
        {
            this.onActionSelected({ maxDistance: Math.min(this.activeUnit.weapon.range, PathManager.defaultMoveCost) });
        };

        AttackManager.prototype.onSweepAction = function ()
        {
            this.onActionSelected({ maxDistance: Math.min(this.activeUnit.weapon.range, PathManager.diagonalMoveCost) });

            this.crossNodes = true;
        };

        AttackManager.prototype.onShortShotAction = function ()
        {
            this.onActionSelected({ maxDistance: this.activeUnit.weapon.range / 2 });
        };

        AttackManager.prototype.onLongShotAction = function ()
        {
            this.onActionSelected({ maxDistance: this.activeUnit.weapon.range });
        };

        AttackManager.prototype.onActionSelected = function (options)
        {
            Renderer.clearRenderablePaths();

            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'cancel', method: this.onAttackActionCancelled, context: this}
            ]);

            // Configure the path manager for the attack range
            var pathOptions = Utility.merge({
                x: this.activeUnit.tileX,
                y: this.activeUnit.tileY,
                maxClimbableHeight: this.activeUnit.maxMoveableHeight,
                ignoreUnits: true
            }, options);

            this.availableAttackTiles = PathManager.calculateAvailableTiles(this.currentMap, pathOptions);

            Renderer.addRenderablePath('attack', this.availableAttackTiles, false);
            this.currentMap.on('tileClick', this, this.onTileSelected);
        };


        AttackManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
            // Clicked on self or non-unit tile
            if (selectedTile.unit === this.activeUnit)
            {
                this.onAttackActionCancelled();
                return;
            }

            this.selectedNode = Utility.getElementByProperty(this.availableAttackTiles, 'tile', selectedTile);
            if (!this.selectedNode)
                return;

            Renderer.clearRenderablePathById('selectedAttackNodes');

            this.selectedNodes = [];
            this.selectedNodes.push(this.selectedNode);

            ActionBarView.removeActionById('Attack');

            if (this.crossNodes)
            {
                var crossNodes = this.calculateCrossNodes(this.selectedNode, this.availableAttackTiles);
                crossNodes.push(this.selectedNode);

                this.selectedNodes = crossNodes;
            }

            Renderer.addRenderablePath('selectedAttackNodes', this.selectedNodes, true);

            for (var i = 0; i < this.selectedNodes.length; ++i)
            {
                if (this.selectedNodes[i].tile.unit != null)
                {
                    ActionBarView.removeAllActions();
                    ActionBarView.addActions([
                        { id: 'attack', method: this.onAttackConfirmed, context: this },
                        { id: 'cancel', method: this.onAttackActionCancelled, context: this }
                    ]);

                    this.selectedTileCost = this.selectedNode.distance / 2;
                    this.activeUnitView.previewAP(this.selectedTileCost);
                    break;
                }
            }
        };

        AttackManager.prototype.calculateCrossNodes = function(selectedNode, availableNodes)
        {
            var crossNodes = [];

            for (var i = 0; i < availableNodes.length; ++i)
            {
                var node = availableNodes[i];

                if ((node.x === selectedNode.x && (node.y === selectedNode.y - 1 || node.y === selectedNode.y + 1)) ||
                    (node.y === selectedNode.y && (node.x === selectedNode.x - 1 || node.x === selectedNode.x + 1)))
                {
                    if (node.tile.unit !== this.activeUnit)
                        crossNodes.push(node);
                }
            }

            return crossNodes;
        };

        AttackManager.prototype.onAttackConfirmed = function ()
        {
            var deltaX = this.selectedNode.x - this.activeUnit.tileX;
            var deltaY = this.selectedNode.y - this.activeUnit.tileY;

            this.activeUnit.setDirection(deltaX, deltaY);
            this.activeUnit.setState('attack');
            Renderer.clearRenderablePaths();

            InputHandler.disableInput();

            this.activeUnit.on('animationComplete', this, function onAttackFinished(animationName)
            {
                for (var i = 0; i < this.selectedNodes.length; ++i)
                {
                    var node = this.selectedNodes[i];

                    if (node.tile.unit)
                        node.tile.unit.damage(this.activeUnit.weapon.damage);
                }

                this.activeUnit.ap -= this.selectedTileCost;
                this.activeUnit.setState('idle');

                this.activeUnitView.previewAP(0);
                this.activeUnitView.setAP(this.activeUnit.ap, this.activeUnit.maxAP);

                this.selectedNode = null;
                this.selectedNodes = null;

                while (this.actionBarSnapshot.length > 0)
                    this.revertActionBar();

                this.activeUnit.off('animationComplete', this, onAttackFinished);
                this.currentMap.off('tileClick', this, this.onTileSelected);

                InputHandler.enableInput();
            });
        };

        AttackManager.prototype.revertActionBar = function ()
        {
            ActionBarView.removeAllActions();
            ActionBarView.addActions(this.actionBarSnapshot.pop());
        };

        return AttackManager;
    });
