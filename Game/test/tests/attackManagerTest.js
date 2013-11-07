define(['Game/src/attackManager', 'Game/src/map', 'Renderer/src/ui/activeUnitView'], function (AttackManager, Map, ActiveUnitView)
{
    'use strict';

    function AttackManagerTest()
    {
        this.name = 'Attack Manager Test';
    }

    AttackManagerTest.prototype.setup = function()
    {
        var map = new Map();
        map.create(4,4);

        this.attackManager = new AttackManager(map, new ActiveUnitView());
        this.attackManager.actionBarSnapshot = [{}];
        this.attackManager.activeUnit = {tileX: 0, tileY: 0};
    };

    AttackManagerTest.prototype.tearDown = function()
    {
        this.attackManager.actionBarSnapshot = [{}];
        this.attackManager.onAttackActionCancelled();
    };

    AttackManagerTest.prototype.testUnitTileIsSelectable = function ()
    {
        this.attackManager.onLongShotAction();

        var targetNode = this.attackManager.availableAttackTiles[0];
        targetNode.tile.unit = {tileX: 0, tileY: 0};

        this.attackManager.onTileSelected(targetNode.tile, 0, 0);

        assertTruthy("Tile was not selected.", this.attackManager.selectedTile);
    };

    AttackManagerTest.prototype.testNonUnitTileIsNotSelectable = function ()
    {
        this.attackManager.onShortShotAction();

        var targetNode = this.attackManager.availableAttackTiles[0];
        targetNode.tile.unit = null;

        this.attackManager.onTileSelected(targetNode.tile, 0, 0);

        assertFalsy("Tile is still selected.", this.attackManager.selectedTile);
    };

    AttackManagerTest.prototype.testNonUnitTileClearsActionBar = function ()
    {
        this.attackManager.selectedTile = {};

        this.attackManager.onTileSelected({unit: null}, 0, 0);

        assertFalsy("Tile was not cleared.", this.attackManager.selectedTile);
    };

    AttackManagerTest.prototype.testActiveUnitTileClearsActionBar = function ()
    {
        this.attackManager.selectedTile = {};

        this.attackManager.onTileSelected({unit: this.attackManager.activeUnit}, 0, 0);

        assertFalsy("Tile was not cleared.", this.attackManager.selectedTile);
    };

    return AttackManagerTest;
});