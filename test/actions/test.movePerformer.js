var MovePerformer = require('../../actionPerformers/movePerformer');
var Map = require('../../gameLogic/map');
var assert = require('assert');
var fileSystem = require('fs');
var GAME_1x3 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x3.json'));
var TestUtility = require('../testUtility');

describe('MovePerformer', function ()
{
    var game, map, moveAction, unit;

    beforeEach(function ()
    {
        game = TestUtility.cloneObject(GAME_1x3);
        map = new Map(game.tiles, game.boundaries);

        unit = {
            _id: 'testUnit',
            tileX: 1,
            tileY: 0,
            type: 'archer',
            ap: 100,
            maxAP: 100,
            username: 'test1'
        };

        moveAction = {
            type: 'move',
            unitID: 'testUnit',
            x: 2,
            y: 0
        };

        game.units.push(unit);
    });

    it('Should update the map', function ()
    {
        var sourceTile = map.getTile(unit.tileX, unit.tileY);
        var targetTile = map.getTile(moveAction.x, moveAction.y);

        MovePerformer.perform(game.units, map, moveAction);

        assert.equal(null, sourceTile.unit, 'The source tile still contains the unit.');
        assert.notEqual(null, targetTile.unit, 'The target tile does not contain the unit.');
    });

    it('Should update unit position', function ()
    {
        var startX = unit.tileX;

        MovePerformer.perform(game.units, map, moveAction);

        assert.notEqual(startX, unit.tileX, 'The unit did not move.');
    });

    it('Should update unit ap', function ()
    {
        var startAP = unit.ap;

        MovePerformer.perform(game.units, map, moveAction);

        assert.notEqual(startAP, unit.ap, 'AP was not subtracted from the unit.');
    });

    it('Should break combat lock', function ()
    {
        var combatLockedUnit = TestUtility.cloneObject(unit);
        combatLockedUnit._id = 'combatLockedUnit';
        combatLockedUnit.username = 'test2';
        combatLockedUnit.tileX = 0;
        combatLockedUnit.tileY = 0;
        combatLockedUnit.target = unit;

        unit.target = combatLockedUnit;

        game.units.push(combatLockedUnit);

        MovePerformer.perform(game.units, map, moveAction);

        assert.equal(null, unit.target || combatLockedUnit.target, 'The combat lock was not broken.');
    });

    it('Should be a valid unit ID', function ()
    {
        moveAction.unitID = 'FakeUnit';

        assert.equal(false, MovePerformer.perform(game.units, map, moveAction), 'Move succeeded when failure expected');
    });

    it('Should be a valid destination', function ()
    {
        moveAction.x = 11111111111111111;
        moveAction.y = 11111111111111111;

        assert.equal(false, MovePerformer.perform(game.units, map, moveAction), 'Move succeeded when failure expected');
    });
});