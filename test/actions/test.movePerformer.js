var MovePerformer = require('../../actionPerformers/movePerformer');
var Map = require('../../gameLogic/map');
var assert = require('assert');
var fileSystem = require('fs');
var GAME_1x3 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x3.json'));
var TestUtility = require('../testUtility');

describe('MovePerformer', function ()
{
    var game, map, moveAction, units, unit;

    beforeEach(function ()
    {
        game = TestUtility.cloneObject(GAME_1x3);
        units = [];

        unit = TestUtility.createUnit(
        {
            x: 1
        });

        units.push(unit);

        map = new Map(game.tiles, units, game.boundaries);

        moveAction = {
            type: 'move',
            unitID: unit._id,
            x: 2,
            y: 0
        };
    });

    it('Should update the map', function ()
    {
        var sourceTile = map.getTile(unit.x, unit.y);
        var targetTile = map.getTile(moveAction.x, moveAction.y);

        MovePerformer.perform(units, map, moveAction);

        assert.equal(null, sourceTile.unit, 'The source tile still contains the unit.');
        assert.notEqual(null, targetTile.unit, 'The target tile does not contain the unit.');
    });

    it('Should update unit position', function ()
    {
        var startX = unit.x;

        MovePerformer.perform(units, map, moveAction);

        assert.notEqual(startX, unit.x, 'The unit did not move.');
    });

    it('Should update unit ap', function ()
    {
        var startAP = unit.ap;

        MovePerformer.perform(units, map, moveAction);

        assert.notEqual(startAP, unit.ap, 'AP was not subtracted from the unit.');
    });

    it('Should break combat lock', function ()
    {
        var combatLockedUnit = TestUtility.createUnit(
        {
            target: unit._id
        });

        units.push(combatLockedUnit);

        unit.target = combatLockedUnit._id;

        MovePerformer.perform(units, map, moveAction);

        assert.equal(null, unit.target || combatLockedUnit.target, 'The combat lock was not broken.');
    });

    it('Should be a valid unit ID', function ()
    {
        moveAction.unitID = 'FakeUnit';

        assert.equal(false, MovePerformer.perform(units, map, moveAction), 'An invalid unit ID should fail.');
    });

    it('Should be a valid destination', function ()
    {
        moveAction.x = 11111111111111111;
        moveAction.y = 11111111111111111;

        assert.equal(false, MovePerformer.perform(units, map, moveAction), 'Move succeeded when failure expected.');
    });
});
