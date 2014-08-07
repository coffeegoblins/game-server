var databaseManager = require('./databaseManager');
var levelManager = require('./levelManager');
var validator = require('./validationUtility');
var ObjectID = require('mongodb').ObjectID;

var gameLogic = require('./gameLogic/gameLogic');
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
        'users.username': currentUserName
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
        name: levelName.toString()
    };

    databaseManager.levelsCollection.find(searchCriteria, function (error, level)
    {
        if (error)
        {
            responseCallback(this.events.createGame.response.error, "Unable to create the game because a valid level was not selected.");
            return;
        }

        this.levelManager.getLevel(function (response, level)
        {
            if (response !== this.events.getLevel.response.success)
            {
                responseCallback(response, level);
                return;
            }

            var game = {
                users: users,
                waitingOn: users,
                level: levelName,
                turnCount: 0,
                creationTime: new Date().getTime()
            };

            this.createSoldiers(users[0], level.data.player1Positions);
            this.createSoldiers(users[1], level.data.player2Positions);

            databaseManager.gamesCollection.insert(game, function (error, gameResult)
            {
                if (error)
                {
                    console.log(error);
                    responseCallback(this.events.createGame.response.error, "Unable to create the game.");
                    return;
                }

                responseCallback(this.events.listeners.gameCreations, gameResult[0]);
                responseCallback(this.events.createGame.response.success, gameResult);
            }.bind(this));

        }.bind(this), levelName);
    }.bind(this));
};

GameManager.prototype.createSoldiers = function (user, positions)
{
    var units = [];
    var positionIndex = 0;
    for (var unitType in user.units)
    {
        for (var i = 0; i < user.units[unitType]; i++)
        {
            var position = positions[positionIndex++];
            units.push({
                id: new ObjectID(),
                tileX: position.x,
                tileY: position.y,
                type: unitType
            });
        }
    }

    user.units = units;
};

GameManager.prototype.updateGame = function (responseCallback, updates)
{
    var update = Array.isArray(updates) ? updates.shift() : updates;
    if (!update)
    {
        responseCallback(this.events.updateGame.response.success);
        return;
    }

    var updateHandler = function (error)
    {
        if (error)
        {
            responseCallback(this.events.updateGame.response.error, error);
            return;
        }

        this.updateGame(responseCallback, updates);
    };

    switch (update.action)
    {
        case 'attack':
            this.performAttack(update.unitID, update.target, updateHandler);
            break;

        case 'move':
            this.performMove(update.unitID, update.tiles, updateHandler);
            break;

        default:
            console.log('Invalid action: ' + update.action);
            break;
    }
};

GameManager.prototype.performMove = function (unitID, tiles, callback)
{
    var searchCriteria = {
        _id: unitID
    };

    databaseManager.unitsCollection.findOne(searchCriteria, function (error, unit)
    {
        if (error || !unit)
        {
            callback(this.events.updateGame.response.error, "Invalid unit provided.");
            return;
        }

        // TODO Get Map from DB
        var availableTiles = this.unitLogic.getMoveTiles(this.map, unit);

        var tile = Utility.getElementByProperty(availableTiles, 'tile', targetTile);
        if (!tile)
        {
            callback(this.events.updateGame.response.error, "Invalid tile provided.");
            return;
        }

        var moveCost = this.unitLogic.getMoveCost(unit, tile.distance);
        if (moveCost > unit.ap)
        {
            callback(this.events.updateGame.response.error, "The unit has insufficient action points to perform that move.");
            return;
        }

        this.unitLogic.endMoveUnit(unit, tile, moveCost);

        databaseManager.unitsCollection.update(searchCriteria, unit, function (error)
        {
            if (error)
            {
                callback(this.events.updateGame.response.error, "Unable to update the unit's position. Please try again.");
                // TODO Disaster recovery, the client will be out of sync with the server
                return;
            }

            callback(null);
        });
    });
};

GameManager.prototype.performAttack = function ()
{
    //    var availableTiles = this.unitLogic.getAttackTiles(this.map, attack);
    //    // TODO Version attacks
    //    var attacks = this.unitLogic.getAttacks(unit);
    //    var attack = attacks.indexOf(attackName);
    //
    //    if (!attack)
    //    {
    //        responseCallback(this.events.updateGame.response.error, "Invalid attack provided.");
    //        return;
    //    }
};


GameManager.prototype.selectGameByID = function (gameID)
{

};

module.exports = GameManager;
