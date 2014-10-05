var OneHandedAttackLogic = require('../../gameLogic/actionLogic/attacks/oneHandedAttackLogic');
var SharedAttackTests = require('./sharedAttackTests');
var Map = require('../../gameLogic/map');
var fileSystem = require('fs');
var GAME_1x3 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x3.json'));
var TestUtility = require('../testUtility');

describe('One Handed Attack', function ()
{
    beforeEach(function ()
    {
        this.attackLogic = OneHandedAttackLogic;
        this.game = TestUtility.cloneObject(GAME_1x3);
        this.map = new Map(this.game.tiles, this.game.boundaries);
        this.units = [];

        this.attackingUnit = TestUtility.createUnit(
        {
            x: 1
        });

        this.defendingUnit = TestUtility.createUnit(
        {
            x: 0
        });

        this.units.push(this.attackingUnit);
        this.units.push(this.defendingUnit);

        var tile = this.map.getTile(0, 0);
        tile.unit = this.defendingUnit;

        this.targetNode = {
            x: 0,
            y: 0,
            tile: tile
        };
    });

    SharedAttackTests.appliesCombatLockTest();
    SharedAttackTests.performAttackTests();
});
