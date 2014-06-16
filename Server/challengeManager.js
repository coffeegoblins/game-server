var UserManager = require('./userManager');
var GameManager = require('./gameManager');
var databaseManager = require('./databaseManager');
var ObjectID = require('mongodb').ObjectID;

function ChallengeManager(events)
{
    this.events = events;
    this.userManager = new UserManager(events);
}

ChallengeManager.prototype.initiateChallenge = function (responseCallback, currentUserID, opponentID)
{
    this.userManager.selectPlayerByID(currentUserID, function (error, user)
    {
        if (error)
        {
            responseCallback(this.events.challengeUser.response.error, error);
            return;
        }

        var searchCriteria = {
            '_id': new ObjectID(opponentID)
        };

        console.log(user._id + " is challenging " + opponentID);

        // TODO Insert Challenge on current user

        // TODO Handle error
        databaseManager.usersCollection.update(searchCriteria,
        {
            '$push':
            {
                "notifications":
                {
                    _id: new ObjectID(),
                    sourceUserId: new ObjectID(user._id),
                    sourceUserName: user.username,
                    type: "CHALLENGE",
                    creationTime: new Date().getTime()
                }
            }
        });
    }.bind(this));
};

ChallengeManager.prototype.acceptChallenge = function (responseCallback, currentUserID, challengeID)
{
    this.userManager.selectPlayerByID(currentUserID, function (error, currentUser)
    {
        if (error)
        {
            responseCallback(this.events.acceptChallenge.response.error, error);
            return;
        }

        var notification = null;

        for (var i = 0; i < currentUser.notifications.length; ++i)
        {
            if (currentUser.notifications[i]._id === challengeID)
            {
                notification = currentUser.notifications[i];
            }
        }

        if (!notification)
        {
            responseCallback(this.events.acceptChallenge.response.error, "Unable to accept the challenge because the challenge notification is not valid.");
            return;
        }

        // TODO Delete Challenge on source user
        this.userManager.selectPlayerByID(notification.sourceUserId, function (error, opponentUser)
        {
            if (error)
            {
                responseCallback(this.events.acceptChallenge.response.error, error);
                return;
            }
        });

        // TODO Create game
        // GameManager.createLobby(new ObjectID());

        var searchCriteria = {
            '_id': new ObjectID(currentUserID)
        };

        databaseManager.usersCollection.update(searchCriteria,
        {
            '$push':
            {
                "games":
                {
                    _id: new ObjectID(),
                    sourceUserId: notification.sourceUserId,
                    sourceUserName: notification.sourceUserName,
                    creationTime: new Date().getTime()
                }
            },
            '$pull':
            {
                "notifications": notification
            }
        });
    }.bind(this));
};

ChallengeManager.prototype.declineChallenge = function (responseCallback, currentUserID, challengeID)
{
    var searchCriteria = {
        '_id': new ObjectID(currentUserID)
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
    });
};

module.exports = ChallengeManager;
