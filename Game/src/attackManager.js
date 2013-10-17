define(['renderer', 'Game/src/scheduler', 'Game/src/pathManager', 'Game/src/turnManager', 'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView', 'Game/src/Utility'],
    function (Renderer, Scheduler, PathManager, TurnManager, ActionBarView, ActiveUnitView, Utility)
    {
        'use strict';

        function AttackManager(currentMap, activeUnitView)
        {
            this.actionBarSnapshot = [];
            this.availableAttackTiles = [];

            this.currentMap = currentMap;
            this.activeUnitView = activeUnitView;
        }

        AttackManager.prototype.onAttackAction = function ()
        {
            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackActionCancelled, context: this}
            ]);

            switch (TurnManager.activeUnit.weapon)
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

            this.currentMap.unregisterTileClickedEventById('attackManager');
        };

        AttackManager.prototype.onShortShotAction = function ()
        {
            Renderer.clearRenderablePaths();
            this.currentMap.registerTileClickedEvent('attackManager', this.onTileSelected, this);

            this.availableAttackTiles = PathManager.calculateAvailableTiles(this.currentMap, TurnManager.activeUnit.tileX, TurnManager.activeUnit.tileY, TurnManager.activeUnit.ap,
                TurnManager.activeUnit.maxMoveableHeight, true);

            Renderer.addRenderablePath('attack', this.availableAttackTiles, false);
        };

        AttackManager.prototype.onLongShotAction = function ()
        {
            Renderer.clearRenderablePaths();
            this.currentMap.registerTileClickedEvent('attackManager', this.onTileSelected, this);

            this.availableAttackTiles = PathManager.calculateAvailableTiles(this.currentMap, TurnManager.activeUnit.tileX, TurnManager.activeUnit.tileY, TurnManager.activeUnit.ap * 2,
                TurnManager.activeUnit.maxMoveableHeight, true);

            Renderer.addRenderablePath('attack', this.availableAttackTiles, false);
        };

        AttackManager.prototype.onTileSelected = function (selectedTile, tileX, tileY)
        {
            // Clicked on self or non-unit tile
            if (selectedTile.unit === TurnManager.activeUnit || !selectedTile.unit)
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

            unit.hp -= TurnManager.activeUnit.attackPower;
            if (unit.hp < 0)
            {
                // TODO Destroy unit
            }

            TurnManager.activeUnit.ap -= this.selectedTileCost;

            this.activeUnitView.previewAP(0);
            this.activeUnitView.setAP(TurnManager.activeUnit.ap, TurnManager.activeUnit.maxAP);

            this.selectedNode = null;
            this.selectedTile = null;

            Renderer.clearRenderablePaths();

            while (this.actionBarSnapshot.length > 0)
                this.revertActionBar();

            this.currentMap.unregisterTileClickedEventById('attackManager');
        };

        AttackManager.prototype.onAttackCancelled = function ()
        {
            // TODO Clear selected unit highlight
            this.currentMap.unregisterTileClickedEventById('attackManager');
            this.revertActionBar();
        };

        AttackManager.prototype.revertActionBar = function ()
        {
            ActionBarView.removeAllActions();
            ActionBarView.addActions(this.actionBarSnapshot.pop());
        };

        return AttackManager;
    });
