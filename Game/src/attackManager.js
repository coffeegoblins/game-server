define(['renderer', 'Game/src/scheduler', 'Game/src/pathManager', 'Game/src/turnManager', 'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView', 'Game/src/Utility'],
    function (Renderer, Scheduler, PathManager, TurnManager, ActionBarView, ActiveUnitView, Utility)
    {
        'use strict';

        function AttackManager(currentMap, activeUnitView)
        {
            this.path = [];
            this.currentMap = currentMap;
            this.currentMap.registerTileClickedEvent('attackManager', this.onTileSelected, this);

            this.activeUnitView = activeUnitView;

            this.actionBarSnapshot = [];
        }

        AttackManager.prototype.initialize = function ()
        {

        };

        AttackManager.prototype.onTileSelected = function(selectedTile, tileX, tileY)
        {
            if (selectedTile.unit == null)
                return;

            if (!Utility.containsElementWithProperty(this.path, 'tile', selectedTile))
                return;

            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            this.activeUnitView.previewAP(TurnManager.activeUnit.attackCost);

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackCancelled, context: this},
                {id: 'Attack', method: this.onAttackConfirmed, context: this}
            ]);

            this.selectedTile = selectedTile;
        };

        AttackManager.prototype.onAttackAction = function ()
        {
            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();

            ActionBarView.addActions([{id: 'Cancel', method: this.onAttackActionCancelled, context: this}]);

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

        AttackManager.prototype.revertActionBar = function ()
        {
            ActionBarView.removeAllActions();
            ActionBarView.addActions(this.actionBarSnapshot.pop());
        };

        AttackManager.prototype.onAttackConfirmed = function ()
        {
            Renderer.clearRenderablePaths();

            while (this.actionBarSnapshot.length > 0)
                this.revertActionBar();

            this.selectedTile.unit.hp -= TurnManager.activeUnit.attackPower;
            TurnManager.activeUnit.ap -= TurnManager.activeUnit.attackCost;

            this.activeUnitView.setAP(TurnManager.activeUnit.ap, TurnManager.activeUnit.maxAP);
        };

        AttackManager.prototype.onAttackCancelled = function ()
        {
            // TODO Clear selected unit highlight
            this.revertActionBar();
        };

        AttackManager.prototype.onAttackActionCancelled = function ()
        {
            Renderer.clearRenderablePaths();
            this.revertActionBar();
        };

        AttackManager.prototype.onShortShotAction = function ()
        {
            Renderer.clearRenderablePaths();

            this.path = PathManager.calculateAvailableTiles(this.currentMap, TurnManager.activeUnit.tileX, TurnManager.activeUnit.tileY, TurnManager.activeUnit.attackRange,
                                                            TurnManager.activeUnit.maxMoveableHeight, true);

            Renderer.addRenderablePath('attack', this.path, false);
        };

        AttackManager.prototype.onLongShotAction = function ()
        {
            Renderer.clearRenderablePaths();

            this.path = PathManager.calculateAvailableTiles(this.currentMap, TurnManager.activeUnit.tileX, TurnManager.activeUnit.tileY, TurnManager.activeUnit.attackRange * 2,
                TurnManager.activeUnit.maxMoveableHeight, true);

            Renderer.addRenderablePath('attack', this.path, false);
        };

        return AttackManager;
    });
