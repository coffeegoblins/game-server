var AttackPerformer = require('../../actionPerformers/attackPerformer');
var Map = require('../../gameLogic/map');
var assert = require('assert');
var fileSystem = require('fs');
var GAME_1x3 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x3.json'));
var TestUtility = require('../testUtility');

describe('AttackPerformer', function ()
{
    var game, map, attackAction, units, attackingUnit, defendingUnit;

    beforeEach(function ()
    {
        game = TestUtility.cloneObject(GAME_1x3);
        map = new Map(game.tiles, game.boundaries);
        units = [];

        attackingUnit = TestUtility.createUnit(
        {
            x: 1
        });

        defendingUnit = TestUtility.createUnit(
        {
            x: 0
        });

        units.push(attackingUnit);
        units.push(defendingUnit);

        map.getTile(defendingUnit.x, defendingUnit.y).unit = defendingUnit;
        map.getTile(attackingUnit.x, attackingUnit.y).unit = attackingUnit;

        attackAction = {
            type: 'oneHanded',
            unitID: attackingUnit._id,
            targetX: 0,
            targetY: 0
        };
    });

    it('Should be a valid unit ID', function ()
    {
        attackAction.unitID = 'FakeUnit';

        assert.equal(false, AttackPerformer.perform(units, map, attackAction), 'An invalid unit ID should fail.');
    });

    it('Should be a valid target node', function ()
    {
        attackAction.targetX = 5000;

        assert.equal(false, AttackPerformer.perform(units, map, attackAction), 'An invalid target node should fail.');
    });

    it('Should have a target unit', function ()
    {
        var targetTile = map.getTile(attackAction.targetX, attackAction.targetY);
        targetTile.unit = null;

        assert.equal(false, AttackPerformer.perform(units, map, attackAction), 'Not having a target unit should fail.');
    });

    it('Should reduce ap of the attacking unit', function ()
    {
        var startAP = attackingUnit.ap;

        AttackPerformer.perform(units, map, attackAction);

        assert.notEqual(startAP, attackingUnit.ap, 'AP was not subtracted from the attacking unit.');
    });

    it('Should set the target', function ()
    {
        AttackPerformer.perform(units, map, attackAction);

        assert.equal(attackingUnit.target, defendingUnit, "The attacking unit does not have the correct target.");
    });

    it('Should remove the previous target', function ()
    {
        var previousTarget = TestUtility.createUnit();
        attackingUnit.target = previousTarget;

        AttackPerformer.perform(units, map, attackAction);

        assert.notEqual(previousTarget, attackingUnit.target, "The attacking unit did not lose the previous target.");
    });

    it('Should set the attacking unit direction', function ()
    {
        attackingUnit.direction.x = 1;
        attackingUnit.direction.y = 1;

        AttackPerformer.perform(units, map, attackAction);

        assert.equal(-1, attackingUnit.direction.x, "The attacking unit direction did not change.");
        assert.equal(0, attackingUnit.direction.y, "The attacking unit direction did not change.");
    });
});
