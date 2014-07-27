var databaseManager = require('./databaseManager');
var ObjectID = require('mongodb').ObjectID;

function ChallengeManager(events, userManager, gameManager, notificationManager)
{
    this.events = events;
    this.userManager = userManager;
    this.gameManager = gameManager;
    this.notificationManager = notificationManager;
}

ChallengeManager.prototype.initiateChallenge = function (responseCallback, currentUserName, opponentUserName, data)
{
    this.userManager.selectPlayer(currentUserName, function (error, user)
    {
        if (error)
        {
            responseCallback(this.events.challengeUser.response.error, error);
            return;
        }

        console.log(user.username + " is challenging " + opponentUserName);

        var notification = {
            _id: new ObjectID(),
            sourceUsername: user.username,
            type: "CHALLENGE",
            data: data.levelName,
            units: data.units,
            creationTime: new Date().getTime()
        };

        this.notificationManager.addNotification(opponentUserName, notification);
    }.bind(this));
};

ChallengeManager.prototype.acceptChallenge = function (responseCallback, currentUserName, challengeID, levelData)
{
    this.userManager.selectPlayer(currentUserName, function (error, currentUser)
    {
        if (error)
        {
            console.log(error);
            responseCallback(this.events.challengeAccepted.response.error, error);
            return;
        }

        console.log(currentUser.notifications);

        var notification = null;
        for (var i = 0; i < currentUser.notifications.length; ++i)
        {
            // Double equals for loose equality (_id is an object)
            if (currentUser.notifications[i]._id == challengeID)
            {
                notification = currentUser.notifications[i];
            }
        }

        if (!notification)
        {
            console.log("Unable to accept the challenge because the challenge notification is not valid.");
            responseCallback(this.events.challengeAccepted.response.error, "Unable to accept the challenge because the challenge notification is not valid.");
            return;
        }

        // TODO Delete Challenge on source user
        this.userManager.selectPlayer(notification.sourceUsername, function (error, opponentUser)
        {
            if (error)
            {
                console.log(error);
                responseCallback(this.events.challengeAccepted.response.error, error);
                return;
            }

            // TODO: Units should probably be transformed into arrays of objects at this point. Don't know what's needed in the database.

            var users = [
                {
                    userName: currentUser.userName,
                    displayName: currentUser.displayName,
                    units: levelData.units
                },
                {
                    userName: opponentUser.userName,
                    displayName: opponentUser.displayName,
                    units: notification.units
                }
            ];

            this.gameManager.createGame(responseCallback, users, notification.data);

            // TODO Handle failure
            this.removeChallenge(responseCallback, currentUserName, challengeID);
        }.bind(this));
    }.bind(this));
};

ChallengeManager.prototype.removeChallenge = function (responseCallback, currentUserName, challengeID)
{
    var searchCriteria = {
        'username': currentUserName
    };

    var updateCriteria = {
        $pull:
        {
            notifications:
            {
                _id: new ObjectID(challengeID)
            }
        }
    };

    databaseManager.usersCollection.update(searchCriteria, updateCriteria, function (error, data)
    {
        if (error)
        {
            console.log(error);
        }
    });
};

module.exports = ChallengeManager;
