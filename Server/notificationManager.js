var UserManager = require('./userManager');
var async = require('async');

function NotificationManager(databaseManager)
{
    this.databaseManager = databaseManager;
    this.userManager = new UserManager(databaseManager);
}

NotificationManager.prototype.initiateChallenge = function (responseCallback, challengerID, opponentID)
{
    var parameters = [challengerID, opponentID];

    async.map(parameters, this.selectPlayersForChallenge.bind(this), this.onPlayersSelected.bind(this, responseCallback));
};

NotificationManager.prototype.selectPlayersForChallenge = function (userID, asyncCallback)
{
    this.userManager.selectPlayerByID(userID, function (error, user)
    {
        if (error)
        {
            throw error;
        }

        asyncCallback(null, user);
    });
};

NotificationManager.prototype.onPlayersSelected = function (responseCallback, error, users)
{
    if (error)
    {
        responseCallback('player_challenge_error', error);
        return;
    }

    var challengerUser = users[0];
    var opponentUser = users[1];

    console.log(challengerUser.username + " (" + challengerUser._id + ") is challenging " + opponentUser.username + " (" + opponentUser._id + ")");

    var notification = {
        sourceUser: challengerUser._id,
        targetUser: opponentUser._id,
        type: "CHALLENGE",
        creationTime: new Date().getTime()
    };

    this.databaseManager.notificationsCollection.insert(notification, function (error)
    {
        if (error)
        {
            responseCallback('player_challenge_error', error);
            console.log("Failed to challenge.");
            return;
        }

        responseCallback('player_challenge_succeeded');
    });
};

module.exports = NotificationManager;
