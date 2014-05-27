var databaseManager = require('./databaseManager');

function GameManager(events)
{
    this.events = events;
}

GameManager.prototype.createGame = function (responseCallback, levelName)
{
    var searchCriteria = {
        name: levelName.toString();
    }

    databaseManager.levelsCollection.find(searchCriteria, function (error, level)
    {
        if (error)
        {
            responseCallback(this.events.createGame.response.error, "Unable to create the game because a valid level was not selected.");
            return;
        }

        databaseManager.gamesCollection.insert(game, function (error, gameResult)
        {
            if (error)
            {
                responseCallback(this.events.createGame.response.error, "Unable to create the game.");
                return;
            }

            responseCallback(this.events.createGame.response.success, gameResult._id);
        });
    });
};

GameManager.prototype.updateGame = function (gameID, game) {

};

GameManager.prototype.validateUpdate = function (game) {

};

GameManager.prototype.selectGameByID = function (gameID) {

};

module.exports = GameManager;
