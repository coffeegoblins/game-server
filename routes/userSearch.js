var validator = require('../validator');
var usersCollection = require('../databaseManager').usersCollection;

module.exports = {
    validate: function (currentUser, searchInput, callback)
    {
        if (!validator.isValidString(searchInput))
        {
            callback("Invalid search input provided.");
            return;
        }

        callback(currentUser.username, searchInput);
    },

    execute: function (socket, currentUsername, searchInput)
    {
        // Exclude current user
        var regex = new RegExp('^(?!' + currentUsername + '$).*' + searchInput + '.*$', "i");

        var searchCriteria = {
            username: regex
        };

        usersCollection.find(searchCriteria).limit(200).toArray(function (error, searchResult)
        {
            if (error || searchResult.length === 0)
            {
                socket.emit(socket.events.userSearch.response.error, "No opponents found.");
                return;
            }

            socket.emit(socket.events.userSearch.response.success, searchResult);
        });
    }
};
