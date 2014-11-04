var gamesCollection = require('../databaseManager').gamesCollection;

module.exports = {
    validate: function (currentUser, callback)
    {
        callback();
    },

    execute: function (socket)
    {
        var searchCriteria = {
            usernames: socket.decoded_token.username
        };

        gamesCollection.find(searchCriteria, function (error, games)
        {
            if (error)
            {
                console.log(error);
                socket.emit(socket.events.getGames.response.error, "Unable to retrieve games.");
                return;
            }

            games.toArray(function (error, gamesArray)
            {
                if (error)
                {
                    socket.emit(this.events.getGames.response.error, error);
                    return;
                }

                socket.emit(socket.events.getGames.response.success, gamesArray);
            }.bind(this));

        });
    }
};
