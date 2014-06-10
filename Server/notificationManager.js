var UserManager = require('./userManager');
var async = require('async');
var databaseManager = require('./databaseManager');

function NotificationManager(events)
{
    this.events = events;
    this.userManager = new UserManager(events);
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
        responseCallback(this.events.challengeUser.response.error, error);
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

    databaseManager.notificationsCollection.insert(notification, function (error)
    {
        if (error)
        {
            responseCallback(this.events.challengeUser.response.error, error);
            console.log("Failed to challenge.");
            return;
        }

        responseCallback(this.events.challengeUser.response.success);
    }.bind(this));
};

module.exports = NotificationManager;
