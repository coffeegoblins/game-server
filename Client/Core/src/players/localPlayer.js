define(['Renderer/src/ui/actionPanel', 'Renderer/src/ui/confirmationPanel', '../inputHandler', '../pathManager', './player', 'renderer', '../utility'],
    function (ActionPanel, ConfirmationPanel, InputHandler, PathManager, Player, Renderer, Utility)
    {
        'use strict';
        function LocalPlayer()
        {
            Player.apply(this, arguments);

            this.isLocal = true;
            this.actionPanel = new ActionPanel();
            this.actionPanel.on('actionSelected', this, this.onActionSelected);
        }

        LocalPlayer.prototype = Object.create(Player.prototype);
        LocalPlayer.prototype.constructor = LocalPlayer;


        LocalPlayer.prototype.performTurn = function (unit)
        {
            Player.prototype.performTurn.call(this, unit);

            this.actionPanel.open(unit, this.getAttacks());
            this.map.on('tileClick', this, this.onTileClick);
            InputHandler.enableInput();
        };

        LocalPlayer.prototype.endTurn = function ()
        {
            Player.prototype.endTurn.call(this);

            InputHandler.disableInput();
            this.actionPanel.close();
            this.onUnitDeselected(this.selectedUnit);
            this.map.off('tileClick', this);
        };

        LocalPlayer.prototype.onTileClick = function (tile, x, y, soldier)
        {
            this.onUnitSelected(soldier);
        };

        LocalPlayer.prototype.onActionSelected = function (actionName)
        {
            Renderer.clearRenderablePaths();
            if (actionName === 'endTurn')
            {
                this.endTurn();
                return;
            }

            this.actionPanel.hide();
            if (actionName === 'move')
            {
                this.availableTiles = PathManager.calculateAvailableTiles(this.map, {
                    x: this.unit.tileX,
                    y: this.unit.tileY,
                    maxDistance: this.unit.ap,
                    maxClimbableHeight: this.unit.maxMoveableHeight
                });

                Renderer.addRenderablePath('moveTiles', this.availableTiles, false);
                this.map.on('tileClick', this, this.onMoveTileSelected);
            }
            else
            {
                this.currentAttack = this.getAttack(actionName);
                this.availableTiles = PathManager.calculateAvailableTiles(this.map, Utility.merge({
                    x: this.unit.tileX,
                    y: this.unit.tileY,
                    maxClimbableHeight: this.unit.maxMoveableHeight,
                    ignoreUnits: true,
                    excludePlayer: this,
                    maxDistance: this.currentAttack.range
                }, this.currentAttack));

                Renderer.addRenderablePath('attack', this.availableTiles, false);
                this.map.on('tileClick', this, this.onAttackTileSelected);
            }

            this.confirmationPanel = new ConfirmationPanel();
            this.confirmationPanel.on('actionSelected', this, this.onPerformActionSelected);
            this.confirmationPanel.open(this.unit);
        };

        LocalPlayer.prototype.onPerformActionSelected = function (actionName)
        {
            if (actionName === 'confirm')
            {
                if (this.currentAttack)
                    this.onAttackConfirmed();
                else
                    this.onMoveConfirmed();
            }
            else
            {
                this.resetActionState();
                Renderer.camera.moveToUnit(this.unit);
            }
        };

        LocalPlayer.prototype.onAttackTileSelected = function (tile, tileX, tileY)
        {
            var hasTarget = false;
            this.selectedTiles = null;
            Renderer.clearRenderablePathById('selectedAttackNodes');
            this.confirmationPanel.target = {tileX: tileX, tileY: tileY};

            this.selectedTile = tile && Utility.getElementByProperty(this.availableTiles, 'tile', tile);
            if (this.selectedTile)
            {
                this.selectedTiles = [this.selectedTile];
                if (this.currentAttack.useCrossNodes)
                {
                    this.selectedTiles.push.apply(this.selectedTiles, this.calculateCrossNodes(this.selectedTile, this.availableTiles));
                }

                for (var i = 0; i < this.selectedTiles.length; i++)
                {
                    if (this.selectedTiles[i].tile.unit != null)
                    {
                        hasTarget = true;
                        break;
                    }
                }
            }

            if (hasTarget)
            {
                this.confirmationPanel.enableConfirm();
                this.unit.statusPanel.previewAP(this.currentAttack.cost);
                Renderer.addRenderablePath('selectedAttackNodes', this.selectedTiles, true);
            }
            else
            {
                this.unit.statusPanel.previewAP();
                this.confirmationPanel.disableConfirm();
            }
        };

        LocalPlayer.prototype.onAttackConfirmed = function ()
        {
            InputHandler.disableInput();
            Renderer.clearRenderablePaths();
            this.actionPanel.hide();
            this.unit.statusPanel.previewAP();

            this.performAttack(this.selectedTile, this.selectedTiles, this.currentAttack);
        };

        LocalPlayer.prototype.onAttackComplete = function ()
        {
            this.resetActionState();
            InputHandler.enableInput();
        };

        LocalPlayer.prototype.onMoveTileSelected = function (tile, tileX, tileY)
        {
            Renderer.clearRenderablePathById('selectedPath');
            this.confirmationPanel.target = {tileX: tileX, tileY: tileY};

            var pathNode = tile && Utility.getElementByProperty(this.availableTiles, 'tile', tile);
            if (pathNode)
            {
                this.selectedTiles = PathManager.calculatePathFromNodes(pathNode, this.unit.tileX, this.unit.tileY);
                this.selectedTile = this.selectedTiles[this.selectedTiles.length - 1];
                this.unit.statusPanel.previewAP(this.selectedTile.distance);

                this.confirmationPanel.enableConfirm();
                Renderer.addRenderablePath('selectedPath', this.selectedTiles, true);
            }
            else
            {
                this.unit.statusPanel.previewAP();
                this.confirmationPanel.disableConfirm();
            }
        };

        LocalPlayer.prototype.onMoveConfirmed = function ()
        {
            InputHandler.disableInput();
            Renderer.clearRenderablePaths();
            this.actionPanel.hide();
            this.unit.statusPanel.previewAP();

            this.moveUnit(this.selectedTiles, this.selectedTile.distance);
        };

        LocalPlayer.prototype.onMoveComplete = function ()
        {
            this.resetActionState();
            InputHandler.enableInput();
        };

        LocalPlayer.prototype.onUnitDeselected = function (unit)
        {
            if (unit && unit !== this.unit)
                this.closeUnitStatusPanel(unit);
        };

        LocalPlayer.prototype.onUnitSelected = function (unit)
        {
            if (unit !== this.unit && unit !== this.selectedUnit)
            {
                if (this.selectedUnit)
                {
                    this.selectedUnit.isTargeted = false;
                    this.onUnitDeselected(this.selectedUnit);
                }

                this.selectedUnit = unit;
                if (this.selectedUnit)
                {
                    this.selectedUnit.isTargeted = true;
                    this.openUnitStatusPanel(this.selectedUnit);
                }
            }
        };

        LocalPlayer.prototype.resetActionState = function ()
        {
            this.selectedTile = null;
            this.selectedTiles = null;
            this.currentAttack = null;
            this.availableTiles = null;

            Renderer.clearRenderablePaths();
            this.unit.statusPanel.previewAP();
            this.actionPanel.show();

            this.map.off('tileClick', this, this.onMoveTileSelected);
            this.map.off('tileClick', this, this.onAttackTileSelected);
        };

        return LocalPlayer;
    });