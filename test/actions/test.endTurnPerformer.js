var EndTurnPerformer = require('../../actionPerformers/EndTurnPerformer');
var Map = require('../../gameLogic/map');
var assert = require('assert');
var fileSystem = require('fs');
var GAME_1x3 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x3.json'));
var TestUtility = require('../testUtility');

describe('EndTurnPerformer', function ()
{
    var game, map, endTurnAction, units, unit;

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

        endTurnAction = {
            type: 'EndTurn'
        };
    });

//    it('Should update the map', function ()
    //    {
    //    });
    //
    //    it('Should update unit position', function ()
    //    {
    //        var startX = unit.x;
    //
    //        EndTurnPerformer.perform(units, map, endTurnAction);
    //
    //        assert.notEqual(startX, unit.x, 'The unit did not EndTurn.');
    //    });
    //
    //    it('Should update unit ap', function ()
    //    {
    //        var startAP = unit.ap;
    //
    //        EndTurnPerformer.perform(units, map, endTurnAction);
    //
    //        assert.notEqual(startAP, unit.ap, 'AP was not subtracted from the unit.');
    //    });
    //
    //    it('Should break combat lock', function ()
    //    {
    //        var combatLockedUnit = TestUtility.createUnit(
    //        {
    //            target: unit._id
    //        });
    //
    //        units.push(combatLockedUnit);
    //
    //        unit.target = combatLockedUnit._id;
    //
    //        EndTurnPerformer.perform(units, map, endTurnAction);
    //
    //        assert.equal(null, unit.target || combatLockedUnit.target, 'The combat lock was not broken.');
    //    });
    //
    //    it('Should be a valid unit ID', function ()
    //    {
    //        endTurnAction.unitID = 'FakeUnit';
    //
    //        assert.equal(false, EndTurnPerformer.perform(units, map, endTurnAction), 'An invalid unit ID should fail.');
    //    });
    //
    //    it('Should be a valid destination', function ()
    //    {
    //        endTurnAction.x = 11111111111111111;
    //        endTurnAction.y = 11111111111111111;
    //
    //        assert.equal(false, EndTurnPerformer.perform(units, map, endTurnAction), 'EndTurn succeeded when failure expected.');
    //    });
});
