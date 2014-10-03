var AttackPerformer = require('../../actionPerformers/attackPerformer');
var Map = require('../../gameLogic/map');
var assert = require('assert');
var fileSystem = require('fs');
var GAME_1x3 = JSON.parse(fileSystem.readFileSync('test/content/GAME_1x3.json'));
var TestUtility = require('../testUtility');

describe('Attack', function ()
{
    var game, map, attackAction, unit;

    beforeEach(function ()
    {
        game = TestUtility.cloneObject(GAME_1x3);
        map = new Map(game.tiles, game.boundaries);

        unit = {
            _id: 'testUnit',
            tileX: 0,
            tileY: 0,
            type: 'archer',
            ap: 100,
            maxAP: 100,
            username: 'test1'
        };

        attackAction = {
            type: 'attack',
            unitID: 'testUnit',
            x: 1,
            y: 0
        };

        game.units.push(unit);
    });

    it('Should be a valid unit ID', function () {

    });

    it('Should be a valid target tile', function () {

    });

    it('Should have a target', function () {

    });

    it('Should break existing combat lock', function () {

    });
});