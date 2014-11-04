var gamesCollection = require('../databaseManager').gamesCollection;
var validator = require('../validator');
var validUnitTypes = require('./gameLogic/gameLogic').unitTypes;
var validHeroTypes = require('./gameLogic/gameLogic').heroTypes;
var ObjectID = require('mongodb').ObjectID;
var async = require('async');

module.exports = {
    validate: function (currentUser, opponentUsername, heroType, levelName, unitTypes, callback)
    {
        if (!validator.isValidString(heroType) || !validHeroTypes[heroType])
        {
            callback("Invalid hero type provided.");
            return;
        }

        if (!validator.isValidString(levelName))
        {
            callback("Invalid level name provided.");
            return;
        }

        if (!validator.isValidArray(unitTypes))
        {
            callback("Invalid version provided.");
            return;
        }

        for (var i = 0; i < unitTypes.length; ++i)
        {
            var unitType = unitTypes[i];
            if (!validator.isValidString(unitType) || !validUnitTypes[unitType])
            {
                callback("Invalid character type provided.");
                return;
            }
        }

        async.parallel([
            validator.isValidUser.bind(validator, currentUser.username),
            validator.isValidUser.bind(validator, opponentUsername),
            validator.isValidLevel.bind(validator, levelName)
        ], function (error, results)
        {
            if (error)
            {
                callback(error);
                return;
            }

            var currentUser = results[0];
            var opponentUser = results[1];
            var level = results[3];

            var heroRace = validHeroTypes[heroType].race;
            if (level.prototypes[heroRace].length !== unitTypes.length)
            {
                callback("Invalid list of characters provided.");
                return;
            }

            callback(null, currentUser, opponentUser, level, heroRace, heroType, unitTypes);
        });
    },

    execute: function (socket, currentUser, opponentUser, level, heroRace, heroType, unitTypes)
    {
        var units = [];

        for (var i = 0; i < level.prototypes[heroRace].length; ++i)
        {
            var prototypeUnit = level.prototypes[heroRace][i];
            var unitIndex = Math.random() * (unitTypes.length - 1);
            var unitType = unitTypes.splice(unitIndex, 1);

            units.push(
            {
                _id: new ObjectID(),
                x: prototypeUnit.x,
                y: prototypeUnit.y,
                type: unitType,
                ap: validUnitTypes[unitType].maxAP,
                maxAP: validUnitTypes[unitType].maxAP,
                hp: 100,
                username: currentUser.username,
                direction:
                {
                    x: 0,
                    y: 0
                }
            });
        }

        var game = {
            usernames: [currentUser.username, opponentUser.username],
            waitingOn: opponentUser,
            level: level.name,
            units: units,
            tiles: level.prototypes.tiles,
            boundaries: level.boundaries,
            turnCount: 0,
            creationTime: new Date().getTime(),
            seed: Math.random()
        };

        gamesCollection.insert(game, function (error, dbGame)
        {
            if (error)
            {
                console.log("Error creating game: " + error);
                socket.emit(socket.events.createGame.response.error, "Unable to create the game.");
                return;
            }

            socket.pushEvent(socket.events.listeners.gameUpdate, [opponentUser], dbGame[0]);
            socket.emit(socket.events.createGame.response.success, dbGame[0]);
        }.bind(this));
    }
};
