var usersCollection = require('./databaseManager').usersCollection;
var levelsCollection = require('./databaseManager').levelsCollection;
var gamesCollection = require('./databaseManager').gamesCollection;
var ObjectID = require('mongodb').ObjectID;

module.exports = {
    isValidString: function (value)
    {
        return value && (typeof value === 'string' || value instanceof String);
    },

    isValidArray: function (array)
    {
        return Array.isArray(array);
    },

    isValidUser: function (username, callback)
    {
        if (!this.isValidString(username))
        {
            callback("Invalid username provided.");
            return;
        }

        var searchCriteria = {
            username: username
        };

        usersCollection.findOne(searchCriteria, function (error, user)
        {
            if (!user || error)
            {
                console.log("Error validating user: " + error);
                callback("Invalid username provided.");
                return;
            }

            callback(null, user);
        }.bind(this));
    },

    isValidLevel: function (levelName, callback)
    {
        if (!this.isValidString(levelName))
        {
            callback("Invalid level name provided.");
            return;
        }

        var searchCriteria = {
            name: levelName
        };

        levelsCollection.findOne(searchCriteria, function (error, level)
        {
            if (!level || error)
            {
                console.log("Error validating level: " + error);
                callback("Invalid level name provided.");
                return;
            }

            callback(null, level);
        }.bind(this));
    },

    isValidGame: function (gameID, callback)
    {
        if (!this.isValidString(gameID))
        {
            callback("Invalid game ID provided.");
            return;
        }

        var searchCriteria = {
            "_id": new ObjectID(gameID)
        };

        gamesCollection.findOne(searchCriteria, function (error, game)
        {
            if (!game || error)
            {
                console.log("Error validating game: " + error);
                callback("Invalid game ID provided.");
                return;
            }

            callback(null, game);
        }.bind(this));
    }
};
