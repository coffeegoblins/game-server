function NotificationManager(notificationsCollection)
{
    this.notificationsCollection = notificationsCollection;
}

NotificationManager.prototype.initiateChallenge = function (challenger, opponent, callback)
{
    var notification = {
        sourceUser: challenger._id,
        targetUser: opponent._id,
        type: "CHALLENGE",
        creationTime: new Date().getTime()
    };

    this.notificationsCollection.insert(notification, function(error)
    {
        if (error)
        {
            callback(error);
            return;
        }
    });
};

module.exports = function (notificationsCollection)
{
    return new NotificationManager(notificationsCollection);
};
