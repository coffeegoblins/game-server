var databaseManager = require('./databaseManager');
var levelManager = require('./levelManager');
var validator = require('./validationUtility');
var ObjectID = require('mongodb').ObjectID;
var gameLogic = require('./gameLogic/gameLogic');
var Map = require('./gameLogic/map');
var Utility = require('./utility');

var serializedGameLogic = JSON.stringify(gameLogic, function (key, value)
{
    return (typeof value === 'function') ? value.toString() : value;
});

function GameManager(events)
{
    this.events = events;
    this.levelManager = new levelManager(events);
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
                var tile = game.tiles[prototypeUnit.tileIndex];

                console.log(owningUser.unitTypes);

                tile.unit = {
                    _id: new ObjectID(),
                    tileX: prototypeUnit.x,
                    tileY: prototypeUnit.y,
                    type: owningUser.unitTypeArray.shift(),
                    username: owningUser.username
                };

                game.units.push(tile.unit);
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

GameManager.prototype.gameStateUpdate = function (responseCallback, gameID, actions)
{
    this.selectGameByID(gameID, function (error, dbGame)
    {
        if (!error)
        {
            responseCallback(this.events.gameStateUpdate.response.error, error);
            return;
        }

        if (!this.validateUnitActions(dbGame, actions))
        {
            responseCallback(this.events.gameStateUpdate.response.error, "An invalid action was provided. Update your game or contact support.");
            return;
        }

        this.updateUnitActions(responseCallback, dbGame);
    });
};

GameManager.prototype.validateUnitActions = function (dbGame, actions)
{
    for (var i = 0; i < actions.length; ++i)
    {
        var action = actions[i];
        switch (action.type)
        {

        case "move":
            {
                var dbUnit = Utility.getElementByProperty(dbGame.units, '_id', action.unitID);
                if (!dbUnit)
                {
                    // The unit does not exist in the database
                    return false;
                }

                var moveNodes = gameLogic.getMoveNodes(dbGame.map, dbUnit);
                if (!Utility.containsElement(moveNodes, action.destinationNode))
                {
                    return false;
                }

                // Pseudo Update dbUnit
                if (dbUnit.target)
                {
                    dbUnit.target.target = null;
                    dbUnit.target = null;
                }

                var dbCurrentTile = dbGame.map.getTile(dbUnit.tileX, dbUnit.tileY);
                dbCurrentTile.unit = null;

                dbUnit.ap -= gameLogic.getMoveCost(dbUnit, action.destinationNode.distance);
                dbUnit.tileX = action.destinationNode.x;
                dbUnit.tileY = action.destinationNode.y;

                var dbTile = dbGame.map.getTile(action.destinationNode.x, action.destinationNode.y);
                dbTile.unit = dbUnit;

                break;
            }

        case "attack":
            {
                // TODO
                break;
            }

        case "endTurn":
            {
                // Nothing to validate
                break;
            }

        default:
            return false;

        }
    }

    return true;
};

GameManager.prototype.updateUnitActions = function (responseCallback, dbGame)
{
    databaseManager.gamesCollection.update(
    {
        '_id': dbGame._id,
    }, dbGame, function (error, rowsModified)
    {
        if (error || rowsModified === 0)
        {
            // TODO Flag game and Log, game is in a broken state
            return;
        }
    }.bind(this));
};

GameManager.prototype.selectGameByID = function (gameID) {

};

module.exports = GameManager;
