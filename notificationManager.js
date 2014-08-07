var databaseManager = require('./databaseManager');

function NotificationManager(events, userManager, pushNotificationCallback)
{
    this.events = events;
    this.userManager = userManager;
    this.pushNotificationCallback = pushNotificationCallback;
}

NotificationManager.prototype.getNotifications = function (responseCallback, userName)
{
    if (!userName)
    {
        responseCallback(this.events.getNotifications.response.error, "You are not logged in.");
        return;
    }

    console.log('Getting notifications for ' + userName);

    this.userManager.selectPlayer(userName, function (error, user)
    {
        if (error || !user)
        {
            console.log(error);
            responseCallback(this.events.getNotifications.response.error, "Unable to retrieve notifications.");
            return;
        }

        console.log(user.username + ' has ' + user.notifications.length + ' notifications');
        responseCallback(this.events.listeners.notifications, user.notifications);
    }.bind(this));
};

NotificationManager.prototype.addNotification = function (username, notification)
{
    var searchCriteria = {
        'username': username
    };

    // TODO Handle error
    databaseManager.usersCollection.update(searchCriteria,
    {
        '$push':
        {
            "notifications": notification
        }
    }, function (error)
    {
        if (error)
        {
            console.log(error);
            return;
        }

        console.log('Notifying ' + username);
        console.log(notification);

        this.pushNotificationCallback(this.events.listeners.notifications, username, notification);
    }.bind(this));
};

module.exports = NotificationManager;
