define(['Renderer/src/ui/actionBarView', 'Renderer/src/ui/unitView', '../inputHandler', '../pathManager', './player', 'renderer', '../utility'], function (ActionBarView, UnitView, InputHandler, PathManager, Player, Renderer, Utility)
{
    'use strict';
    function LocalPlayer()
    {
        Player.apply(this, arguments);

        this.isLocal = true;
        this.actionBarView = new ActionBarView(document.getElementById('actionBarView'));

        this.targetUnitView = new UnitView(document.createElement('div'));
        this.targetUnitView.element.className = 'unit-view secondary';
        document.body.appendChild(this.targetUnitView.element);

        this.renderableTurnQueue.on('selectUnit', this, this.onUnitSelected);
        this.renderableTurnQueue.on('deselectUnit', this, this.onUnitDeselected);
    }

    LocalPlayer.prototype = Object.create(Player.prototype);
    LocalPlayer.prototype.constructor = LocalPlayer;


    LocalPlayer.prototype.performTurn = function (unit)
    {
        Player.prototype.performTurn.call(this, unit);

        this.actionBarView.clear();
        this.actionBarView.pushState([
            {name: 'move', displayName: 'Move', method: this.onMoveAction.bind(this)},
            Utility.merge(this.getAttackAction(), {method: this.onAttackAction.bind(this)}),
            {name: 'endTurn', displayName: 'End Turn', method: this.endTurn.bind(this)}
        ]);

        this.actionBarView.show();
        this.map.on('tileClick', this, this.onTileClick);
        InputHandler.enableInput();
    };

    LocalPlayer.prototype.endTurn = function ()
    {
        Player.prototype.endTurn.call(this);

        InputHandler.disableInput();
        this.actionBarView.hide();
        this.renderableTurnQueue.select();
        this.map.off('tileClick', this);
    };

    LocalPlayer.prototype.onTileClick = function (tile, x, y, soldier)
    {
        this.renderableTurnQueue.select(soldier);
    };


    LocalPlayer.prototype.getAttackAction = function ()
    {
        if (this.unit.weapon.type === 'archer')
            return {name: 'rangeAttack', displayName: 'Attack'};

        return {name: 'attack', displayName: 'Attack'};
    };

    LocalPlayer.prototype.onAttackAction = function ()
    {
        var actions = [];
        var attacks = this.getAttacks();
        for (var i = 0; i < attacks.length; i++)
        {
            var attack = attacks[i];
            attack.method = this.onAttackSelected.bind(this, attack);

            if (attack.cost > this.unit.ap)
                attack.isDisabled = true;

            actions.push(attack);
        }

        actions.push({name: 'cancel', displayName: 'cancel', method: this.resetActionState.bind(this)});
        this.actionBarView.pushState(actions);
    };

    LocalPlayer.prototype.onAttackSelected = function (attack)
    {
        attack.maxDistance = this.getAttackRange(attack.name);
        this.currentAttack = attack;
        Renderer.clearRenderablePaths();

        this.actionBarView.pushState([
            Utility.merge(this.getAttackAction(), {method: this.onAttackConfirmed.bind(this), isDisabled: true}),
            {name: 'cancel', displayName: 'cancel', method: this.resetActionState.bind(this, 1)}
        ]);

        this.availableTiles = PathManager.calculateAvailableTiles(this.map, Utility.merge({
            x: this.unit.tileX,
            y: this.unit.tileY,
            maxClimbableHeight: this.unit.maxMoveableHeight,
            ignoreUnits: true,
            excludePlayer: this
        }, attack));


        Renderer.addRenderablePath('attack', this.availableTiles, false);
        this.map.on('tileClick', this, this.onAttackTileSelected);
    };

    LocalPlayer.prototype.onAttackTileSelected = function (tile)
    {
        var hasTarget = false;
        this.selectedTiles = null;
        Renderer.clearRenderablePathById('selectedAttackNodes');

        this.selectedTile = Utility.getElementByProperty(this.availableTiles, 'tile', tile);
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
            this.actionBarView.enableAction(this.getAttackAction().name);
            this.activeUnitView.previewAP(this.currentAttack.cost);
            Renderer.addRenderablePath('selectedAttackNodes', this.selectedTiles, true);
        }
        else
        {
            this.activeUnitView.previewAP();
            this.actionBarView.disableAction(this.getAttackAction().name);
        }
    };

    LocalPlayer.prototype.onAttackConfirmed = function ()
    {
        InputHandler.disableInput();
        Renderer.clearRenderablePaths();
        this.actionBarView.goToState(0);

        this.performAttack(this.selectedTile, this.selectedTiles, this.currentAttack);
        this.activeUnitView.updateValues();
    };

    LocalPlayer.prototype.onAttackComplete = function ()
    {
        this.targetUnitView.updateValues();
        this.resetActionState();
        InputHandler.enableInput();
    };

    LocalPlayer.prototype.onMoveAction = function ()
    {
        this.actionBarView.pushState([
            {name: 'confirmMove', displayName: 'Move', method: this.onMoveConfirmed.bind(this), isDisabled: true},
            {name: 'cancel', displayName: 'Cancel', method: this.resetActionState.bind(this)}
        ]);

        this.availableTiles = PathManager.calculateAvailableTiles(this.map, {
            x: this.unit.tileX,
            y: this.unit.tileY,
            maxDistance: this.unit.ap,
            maxClimbableHeight: this.unit.maxMoveableHeight
        });

        Renderer.clearRenderablePaths();
        Renderer.addRenderablePath('moveTiles', this.availableTiles, false);
        this.map.on('tileClick', this, this.onMoveTileSelected);
    };

    LocalPlayer.prototype.onMoveTileSelected = function (tile)
    {
        Renderer.clearRenderablePathById('selectedPath');

        var pathNode = Utility.getElementByProperty(this.availableTiles, 'tile', tile);
        if (pathNode)
        {
            this.selectedTiles = PathManager.calculatePathFromNodes(pathNode, this.unit.tileX, this.unit.tileY);
            this.selectedTile = this.selectedTiles[this.selectedTiles.length - 1];
            this.activeUnitView.previewAP(this.selectedTile.distance);

            this.actionBarView.enableAction('confirmMove');
            Renderer.addRenderablePath('selectedPath', this.selectedTiles, true);
        }
        else
        {
            this.activeUnitView.previewAP();
            this.actionBarView.disableAction('confirmMove');
        }
    };

    LocalPlayer.prototype.onMoveConfirmed = function ()
    {
        InputHandler.disableInput();
        Renderer.clearRenderablePaths();
        this.actionBarView.goToState(0);
        this.activeUnitView.previewAP();
        this.moveUnit(this.selectedTiles, this.selectedTile.distance);
    };

    LocalPlayer.prototype.onMoveComplete = function ()
    {
        this.resetActionState();
        InputHandler.enableInput();
    };

    LocalPlayer.prototype.onUnitDeselected = function ()
    {
        this.targetUnitView.hide();
    };

    LocalPlayer.prototype.onUnitSelected = function (unit)
    {
        this.targetUnitView.show(unit);
    };

    LocalPlayer.prototype.resetActionState = function (actionState)
    {
        this.selectedTile = null;
        this.selectedTiles = null;
        this.availableTiles = null;

        Renderer.clearRenderablePaths();
        this.activeUnitView.previewAP();
        this.map.off('tileClick', this, this.onAttackTileSelected);
        this.map.off('tileClick', this, this.onMoveTileSelected);
        this.actionBarView.goToState(actionState || 0);
    };

    return LocalPlayer;
});