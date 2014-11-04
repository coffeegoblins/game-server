var gamesCollection = require('../databaseManager').gamesCollection;
var validator = require('../validator');
var Map = require('../gameLogic/map');
var ActionPerformer = require('../actionPerformers/actionPerformer');
var async = require('async');

module.exports = {
    validate: function (currentUser, update, callback)
    {
        async.parallel([
            validator.isValidGame.bind(this, update.gameID),
            validator.isValidUser.bind(this, currentUser.username)
        ], function (error, results)
        {
            if (error)
            {
                callback(error);
                return;
            }

            var game = results[0];
            var map = new Map(game.tiles, game.units, game.boundaries);

            for (var i = 0; i < update.actions.length; ++i)
            {
                var action = update.actions[i];

                if (!ActionPerformer.perform(game, map, action))
                {
                    console.log("Invalid action provided", action);
                    callback("Invalid action provided.");
                    return;
                }
            }

            callback(null, game, update.actions);
        });
    },

    execute: function (socket, validatedGame, validatedActions)
    {
        var searchCriteria = {
            '_id': validatedGame._id
        };

        gamesCollection.update(searchCriteria, validatedGame, function (error, rowsModified)
        {
            if (error || rowsModified === 0)
            {
                console.log("Update game failed.", error);
                socket.emit(socket.events.updateGame.response.error, "Unable to update the game.");
                return;
            }

            var userIndex = validatedGame.usernames.indexOf(socket.decoded_token.username);
            var opponents = validatedGame.usernames.splice(userIndex, 1);

            socket.emit(socket.events.updateGame.response.success);
            socket.pushEvent(socket.events.listeners.gameUpdate, opponents, validatedActions);
        });
    }
};
