var UserManager = require('./userManager');
var GameManager = require('./gameManager');
var databaseManager = require('./databaseManager');
var ObjectID = require('mongodb').ObjectID;

function ChallengeManager(events)
{
    this.events = events;
    this.userManager = new UserManager(events);
    this.gameManager = new GameManager(events);
}

ChallengeManager.prototype.initiateChallenge = function (responseCallback, currentUserName, opponentUserName, levelName)
{
    this.userManager.selectPlayer(currentUserName, function (error, user)
    {
        if (error)
        {
            responseCallback(this.events.challengeUser.response.error, error);
            return;
        }

        var searchCriteria = {
            'username': opponentUserName
        };

        console.log(user.username + " is challenging " + opponentUserName);

        // TODO Handle error
        databaseManager.usersCollection.update(searchCriteria,
            {
                '$push':
                {
                    "notifications":
                    {
                        _id: new ObjectID(),
                        sourceUserName: user.username,
                        type: "CHALLENGE",
                        data: levelName,
                        creationTime: new Date().getTime()
                    }
                }
            },
            function () {

            });
    }.bind(this));
};

ChallengeManager.prototype.acceptChallenge = function (responseCallback, currentUserName, challengeID)
{
    this.userManager.selectPlayer(currentUserName, function (error, currentUser)
    {
        if (error)
        {
            console.log(error);
            responseCallback(this.events.challengeAccepted.response.error, error);
            return;
        }

        var notification = null;

        console.log(currentUser.notifications);

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
        this.userManager.selectPlayer(notification.sourceUserName, function (error, opponentUser)
        {
            if (error)
            {
                console.log(error);
                responseCallback(this.events.challengeAccepted.response.error, error);
                return;
            }

            var users = [
                {
                    username: currentUser.username,
                    lowerCaseUsername: currentUser.lowerCaseUsername,
                    units: []
                },
                {
                    username: opponentUser.username,
                    lowerCaseUsername: opponentUser.lowerCaseUsername,
                    units: []
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
        'lowerCaseUsername': currentUserName.toLowerCase()
    };

    databaseManager.usersCollection.update(searchCriteria,
    {
        '$pull':
        {
            "notifications":
            {
                _id: challengeID
            }
        }
    }, function () {});
};

module.exports = ChallengeManager;
