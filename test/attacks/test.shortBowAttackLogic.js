var ShortBowAttackLogic = require('../../gameLogic/actionLogic/attacks/shortBowAttackLogic');
var SharedAttackTests = require('./sharedAttackTests');
var Map = require('../../gameLogic/map');
var fileSystem = require('fs');
var GAME_1x20 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x20.json'));
var TestUtility = require('../testUtility');

describe('Short Bow Attack', function ()
{
    beforeEach(function ()
    {
        this.attackLogic = ShortBowAttackLogic;
        this.game = TestUtility.cloneObject(GAME_1x20);
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

        this.map = new Map(this.game.tiles, this.units, this.game.boundaries);

        var tile = this.map.getTile(0, 0);
        tile.unit = this.defendingUnit;

        this.targetNode = {
            x: 0,
            y: 0,
            tile: tile
        };
    });

    SharedAttackTests.occlusionTests();
    SharedAttackTests.performAttackTests();
    SharedAttackTests.doesNotApplyCombatLock();

    it('Cannot attack immediate neighbors', function () {

    });
});
