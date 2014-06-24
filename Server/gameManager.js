var databaseManager = require('./databaseManager');
var validator = require('./validationUtility');
var ObjectID = require('mongodb').ObjectID;

function GameManager(events)
{
    this.events = events;
}

GameManager.prototype.getGames = function (responseCallback, currentUserName)
{
    if (!currentUserName)
    {
        responseCallback(this.events.getGames.response.error, "A valid username was not provided.");
        return;
    }

    console.log("Getting games for: " + currentUserName);

    var searchCriteria = {
        'users.lowerCaseUsername': currentUserName.toLowerCase()
    }

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

            // TODO Remove
            console.log(gamesArray);

            responseCallback(this.events.getGames.response.success, gamesArray);
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

        var game = {
            users: users,
            waitingOn: users,
            level: level,
            turnCount: 0,
            creationTime: new Date().getTime()
        };

        databaseManager.gamesCollection.insert(game, function (error, gameResult)
        {
            if (error)
            {
                console.log(error);
                responseCallback(this.events.createGame.response.error, "Unable to create the game.");
                return;
            }

            responseCallback(this.events.createGame.response.success, gameResult);
        }.bind(this));
    }.bind(this));
};

GameManager.prototype.updateGame = function (responseCallback, updates)
{
    if (updates.length === 0)
    {
        responseCallback(this.events.updateGame.response.success);
        return;
    }

    var update = updates.shift();

    var updateHandler = function (error)
    {
        if (error)
        {
            responseCallback(this.events.updateGame.response.error, error);
            return;
        }

        updateGame(responseCallback, updates);
    };

    switch (update.action)
    {
    case 'MOVE':
        this.performMove(update.unitID, update.target, updateHandler);
        break;

    case 'ATTACK':
        this.performAttack(update.unitID, update.target, updateHandler);
        break;
    }
};

GameManager.prototype.performMove = function (unitID, targetTile, callback)
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
    var availableTiles = this.unitLogic.getAttackTiles(this.map, attack);
    // TODO Version attacks
    var attacks = this.unitLogic.getAttacks(unit);
    var attack = attacks.indexOf(attackName);

    if (!attack)
    {
        responseCallback(this.events.updateGame.response.error, "Invalid attack provided.");
        return;
    }
};


GameManager.prototype.selectGameByID = function (gameID) {

};

module.exports = GameManager;
