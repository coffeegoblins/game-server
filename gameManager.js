var databaseManager = require('./databaseManager');
var levelManager = require('./levelManager');
var ObjectID = require('mongodb').ObjectID;
var gameLogic = require('./gameLogic/gameLogic');
var Map = require('./gameLogic/map');
var ActionPerformer = require('./actionPerformers/actionPerformer');

var serializedGameLogic = JSON.stringify(gameLogic, function (key, value)
{
    return (typeof value === 'function') ? value.toString() : value;
});

function GameManager(events, pushNotificationCallback)
{
    this.events = events;
    this.levelManager = new levelManager(events);
    this.pushNotificationCallback = pushNotificationCallback;
}

GameManager.prototype.getGameLogic = function (responseCallback, version)
{
    if (version !== gameLogic.version)
    {
        responseCallback(this.events.getGameLogic.response.success, serializedGameLogic);
    }
};

GameManager.prototype.getGames = function (responseCallback, currentUserName)
{
    if (!currentUserName)
    {
        responseCallback(this.events.getGames.response.error, "A valid username was not provided.");
        return;
    }

    console.log("Getting games for: " + currentUserName);

    var searchCriteria = {
        'usernames': currentUserName
    };

    databaseManager.gamesCollection.find(searchCriteria, function (error, games)
    {
        if (error)
        {
            console.log(error);
            responseCallback(this.events.getGames.response.error, "Unable to retrieve the list of games.");
            return;
        }

        games.toArray(function (error, gamesArray)
        {
            if (error)
            {
                responseCallback(this.events.getGames.response.success, error);
                return;
            }

            responseCallback(this.events.listeners.gameCreations, gamesArray);
        }.bind(this));
    }.bind(this));
};

GameManager.prototype.createGame = function (responseCallback, users, levelName)
{
    var searchCriteria = {
        name: levelName
    };

    console.log(users);

    var usernames = [];
    for (var i = 0; i < users.length; ++i)
    {
        var user = users[i];

        usernames.push(user.username);

        // TODO Pass over string list from client
        user.unitTypeArray = [];

        for (var unitType in user.unitTypes)
        {
            for (var x = 0; x < user.unitTypes[unitType]; ++x)
            {
                user.unitTypeArray.push(unitType);
            }
        }

        console.log(user.unitTypeArray);
    }

    databaseManager.levelsCollection.findOne(searchCriteria, function (error, level)
    {
        if (error)
        {
            responseCallback(this.events.createGame.response.error, "Invalid level.");
            return;
        }

        var game = {
            usernames: usernames,
            waitingOn: usernames,
            level: levelName,
            units: [],
            tiles: level.prototypes.tiles,
            boundaries: level.boundaries,
            turnCount: 0,
            creationTime: new Date().getTime()
        };


        // Set users to starting positions
        for (var i = 0; i < level.prototypes.units.length; ++i)
        {
            var prototypeUnit = level.prototypes.units[i];

            var owningUser = users[prototypeUnit.userIndex];
            if (owningUser)
            {
                var unitType = owningUser.unitTypeArray.shift();

                game.units.push(
                {
                    _id: new ObjectID(),
                    x: prototypeUnit.x,
                    y: prototypeUnit.y,
                    type: unitType,
                    ap: gameLogic.unitTypes[unitType].maxAP,
                    maxAP: gameLogic.unitTypes[unitType].maxAP,
                    hp: 100,
                    username: owningUser.username,
                    direction:
                    {
                        x: 0,
                        y: 0
                    }
                });
            }
        }

        databaseManager.gamesCollection.insert(game, function (error, dbGame)
        {
            if (error)
            {
                console.log(error);
                responseCallback(this.events.createGame.response.error, "Unable to create the game.");
                return;
            }

            responseCallback(this.events.listeners.gameCreations, dbGame[0]);
            responseCallback(this.events.createGame.response.success, dbGame[0]);
        }.bind(this));

    }.bind(this));
};

GameManager.prototype.gameStateUpdate = function (responseCallback, currentUsername, gameStateUpdates)
{
    console.log("Update received");

    databaseManager.gamesCollection.findOne(
    {
        "_id": new ObjectID(gameStateUpdates.gameID)
    }, function (error, dbGame)
    {
        if (error)
        {
            console.log("Error: ", error);
            responseCallback(this.events.gameStateUpdate.response.error, error);
            return;
        }

        var map = new Map(dbGame.tiles, dbGame.units, dbGame.boundaries);

        console.log("Map created.");

        if (!this.validateUnitActions(dbGame.units, map, gameStateUpdates.actions))
        {
            responseCallback(this.events.gameStateUpdate.response.error, "An invalid action was provided. Update your game or contact support.");
            return;
        }

        this.updateUnitActions(responseCallback, currentUsername, dbGame, gameStateUpdates.actions);
    }.bind(this));
};

GameManager.prototype.validateUnitActions = function (units, map, actions)
{
    for (var i = 0; i < actions.length; ++i)
    {
        var action = actions[i];

        if (!ActionPerformer.perform(units, map, action))
        {
            console.log("Action Invalid", action);
            return false;
        }
    }

    return true;
};

GameManager.prototype.updateUnitActions = function (responseCallback, currentUsername, dbGame, actions)
{
    console.log("Updating game");

    databaseManager.gamesCollection.update(
    {
        '_id': dbGame._id,
    }, dbGame, function (error, rowsModified)
    {
        if (error || rowsModified === 0)
        {
            console.log("Error: ", error);
            // TODO Flag game and Log, game is in a broken state
            return;
        }

        for (var i = 0; i < dbGame.usernames.length; ++i)
        {
            if (dbGame.usernames[i] !== currentUsername)
            {
                responseCallback(this.events.gameStateUpdate.response.success);
                console.log("Sending actions", actions);
                this.pushNotificationCallback(this.events.listeners.gameUpdates, dbGame.usernames[i], actions);
            }
        }
    }.bind(this));
};

module.exports = GameManager;
