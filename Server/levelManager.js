var databaseManager = require('./databaseManager');

function LevelManager(events)
{
    this.events = events;
}

LevelManager.prototype.getLevels = function (responseCallback)
{
    databaseManager.levelsCollection.find({}, function (error, levels)
    {
        if (error)
        {
            console.log(error);
            responseCallback(this.events.getLevels.response.error, "Unable to retrieve levels");
            return;
        }

        levels.toArray(function (error, levelsArray)
        {
            if (error)
            {
                responseCallback(this.events.getLevels.response.error, "Unable to retrieve levels");
                return;
            }

            responseCallback(this.events.getLevels.response.success, levelsArray);
        }.bind(this));
    }.bind(this));
};

LevelManager.prototype.getLevel = function (responseCallback, levelName)
{
    var searchCriteria = {
        name: levelName
    };

    databaseManager.levelsCollection.findOne(searchCriteria, function (error, level)
    {
        if (error)
        {
            console.log(error);
            responseCallback(this.events.getLevel.response.error, "Unable to retrieve level: " + levelName);
            return;
        }

        responseCallback(this.events.getLevel.response.success, level);
    }.bind(this));
};

module.exports = LevelManager;
