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
            switch (this.activeUnit.type)
            {
                case 'archer':
                    actions.push({id: 'ShortShot', method: this.onShortShotAction, context: this});
                    actions.push({id: 'LongShot', method: this.onLongShotAction, context: this});
                    break;

                case 'swordAndShield':
                    actions.push({id: 'Strike', method: this.onStrikeAction, context: this});
                    actions.push({id: 'Shield Bash', method: this.onShieldBash, context: this});
                    break;

                case 'twoHanded':
                    actions.push({id: 'Strike', method: this.onStrikeAction, context: this});
                    actions.push({id: 'Sweep', method: this.onSweepAction, context: this});
                    break;

                case 'dualWield':
                    actions.push({id: 'Strike', method: this.onStrikeAction, context: this});
                    break;
            }

            actions.push({id: 'Cancel', method: this.onAttackActionCancelled, context: this});
            ActionBarView.addActions(actions);
        };

        AttackManager.prototype.onAttackActionCancelled = function ()
        {
            Renderer.clearRenderablePaths();
            this.revertActionBar();

            this.selectedTile = null;
            this.selectedNode = null;
            this.currentMap.off('tileClick', this, this.onTileSelected);
        };


        AttackManager.prototype.onShieldBash = function ()
        {
            this.onActionSelected({maxDistance: Math.min(this.activeUnit.ap, PathManager.defaultMoveCost)});
        };

        AttackManager.prototype.onStrikeAction = function ()
        {
            this.onActionSelected({maxDistance: Math.min(this.activeUnit.ap, PathManager.defaultMoveCost)});
        };

        AttackManager.prototype.onSweepAction = function ()
        {
            this.onActionSelected({maxDistance: Math.min(this.activeUnit.ap, PathManager.diagonalMoveCost)});
        };

        AttackManager.prototype.onShortShotAction = function ()
        {
            this.onActionSelected({maxDistance: this.activeUnit.ap});
        };

        AttackManager.prototype.onLongShotAction = function ()
        {
            this.onActionSelected({maxDistance: this.activeUnit.ap * 2});
        };

        AttackManager.prototype.onActionSelected = function (options)
        {
            Renderer.clearRenderablePaths();

            // Save the current action bar state
            this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Cancel', method: this.onAttackActionCancelled, context: this}
            ]);

            // Configure the path manager for the attach range
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
            if (selectedTile.unit === this.activeUnit || !selectedTile.unit)
            {
                this.onAttackActionCancelled();
                return;
            }

            this.selectedNode = Utility.getElementByProperty(this.availableAttackTiles, 'tile', selectedTile);
            if (!this.selectedNode)
                return;

            // Save the current action bar state
            //this.actionBarSnapshot.push(ActionBarView.actionsList.slice(0));

            ActionBarView.removeAllActions();
            ActionBarView.addActions([
                {id: 'Attack', method: this.onAttackConfirmed, context: this},
                {id: 'Cancel', method: this.onAttackActionCancelled, context: this}
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

        AttackManager.prototype.revertActionBar = function ()
        {
            ActionBarView.removeAllActions();
            ActionBarView.addActions(this.actionBarSnapshot.pop());
        };

        return AttackManager;
    });
