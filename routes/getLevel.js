var validator = require('../validator');
var levelsCollection = require('./databaseManager').levelsCollection;

module.exports = {
    validate: function (currentUser, levelName, callback)
    {
        if (!validator.isValidString(levelName))
        {
            callback("Invalid level name provided.");
            return;
        }

        callback(null, levelName);
    },

    execute: function (socket, levelName)
    {
        var searchCriteria = {
            name: levelName
        };

        levelsCollection.findOne(searchCriteria, function (error, level)
        {
            if (error)
            {
                console.log("Error retrieving level " + levelName, error);
                socket.emit(socket.events.getLevel.response.error, "Unable to retrieve the level.");
                return;
            }

            socket.emit(socket.events.getLevel.response.success, level);
        }.bind(this));
    }
};
