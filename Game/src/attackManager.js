define(['renderer', 'Game/src/pathManager', 'Renderer/src/ui/actionBarView', 'Game/src/utility'],
    function (Renderer, PathManager, ActionBarView, Utility)
    {
        'use strict';

        function AttackManager(currentMap, activeUnitView)
        {
            this.actionBarSnapshot = [];
            this.availableAttackTiles = [];

            this.currentMap = currentMap;
            this.activeUnitView = activeUnitView;
        }

        AttackManager.prototype.onBeginTurn = function(activeUnit)
        {
            this.activeUnit = activeUnit;
        };

        AttackManager.prototype.onAttackAction = function ()
        {
            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackActionCancelled, context: this}
            ]);

            switch (this.activeUnit.weapon)
            {
                case 'bow':
                    ActionBarView.addActions([
                        {id: 'ShortShot', method: this.onShortShotAction, context: this},
                        {id: 'LongShot', method: this.onLongShotAction, context: this}
                    ]);

                    break;

                case 'twoHandedSword':

                    break;

                case 'dualWieldSwords':

                    break;

                case 'swordAndShield':

                    break;
            }
        };

        AttackManager.prototype.onAttackActionCancelled = function ()
        {
            Renderer.clearRenderablePaths();
            this.revertActionBar();

            this.currentMap.off('tileClick', this, this.onTileSelected);
        };

        AttackManager.prototype.onShortShotAction = function ()
        {
            Renderer.clearRenderablePaths();

            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackActionCancelled, context: this}
            ]);

            this.currentMap.on('tileClick', this, this.onTileSelected);

            this.availableAttackTiles = PathManager.calculateAvailableTiles(this.currentMap, this.activeUnit.tileX, this.activeUnit.tileY, this.activeUnit.ap,
                this.activeUnit.maxMoveableHeight, true);

            Renderer.addRenderablePath('attack', this.availableAttackTiles, false);
        };

        AttackManager.prototype.onLongShotAction = function ()
        {
            Renderer.clearRenderablePaths();

            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackActionCancelled, context: this}
            ]);

            this.currentMap.on('tileClick', this, this.onTileSelected);

            this.availableAttackTiles = PathManager.calculateAvailableTiles(this.currentMap, this.activeUnit.tileX, this.activeUnit.tileY, this.activeUnit.ap * 2,
                this.activeUnit.maxMoveableHeight, true);

            Renderer.addRenderablePath('attack', this.availableAttackTiles, false);
        };

        AttackManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
            // Clicked on self or non-unit tile
            if (selectedTile.unit === this.activeUnit || !selectedTile.unit)
            {
                if (this.selectedTile)
                {
                    this.selectedTile = null;
                    this.selectedNode = null;
                    this.activeUnitView.previewAP(0);
                    this.revertActionBar();
                }

                return;
            }

            this.selectedNode = Utility.getElementByProperty(this.availableAttackTiles, 'tile', selectedTile);

            if (!this.selectedNode)
                return;

            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackCancelled, context: this},
                {id: 'Attack', method: this.onAttackConfirmed, context: this}
            ]);

            this.selectedTileCost = this.selectedNode.distance / 2;
            this.activeUnitView.previewAP(this.selectedTileCost);

            this.selectedTile = selectedTile;
        };

        AttackManager.prototype.onAttackConfirmed = function ()
        {
            var unit = this.selectedTile.unit;

            unit.hp -= this.activeUnit.attackPower;
            if (unit.hp < 0)
            {
                // TODO Destroy unit
            }

            this.activeUnit.ap -= this.selectedTileCost;

            this.activeUnitView.previewAP(0);
            this.activeUnitView.setAP(this.activeUnit.ap, this.activeUnit.maxAP);

            this.selectedNode = null;
            this.selectedTile = null;

            Renderer.clearRenderablePaths();

            while (this.actionBarSnapshot.length > 0)
                this.revertActionBar();

            this.currentMap.off('tileClick', this, this.onTileSelected);
        };

        AttackManager.prototype.onAttackCancelled = function ()
        {
            // TODO Clear selected unit highlight
            this.revertActionBar();
        };

        AttackManager.prototype.revertActionBar = function ()
        {
            ActionBarView.removeAllActions();
            ActionBarView.addActions(this.actionBarSnapshot.pop());
        };

        return AttackManager;
    });
