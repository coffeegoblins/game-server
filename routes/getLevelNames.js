var levelsCollection = require('./databaseManager').levelsCollection;

module.exports = {
    validate: function (currentUser, callback)
    {
        callback();
    },

    execute: function (socket)
    {
        levelsCollection.find().toArray(function (error, levelArray)
        {
            if (error)
            {
                console.log("Error retrieving level names", error);
                socket.emit(socket.events.getLevelNames.response.error, "Unable to retrieve the list of levels.");
                return;
            }

            for (var i = 0; i < levelArray.length; ++i)
            {
                levelArray[i] = levelArray[i].name;
            }

            socket.emit(socket.events.getLevelNames.response.success, levelArray);
        }.bind(this));
    }
};
