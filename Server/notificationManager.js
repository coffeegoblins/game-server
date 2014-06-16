var UserManager = require('./userManager');

function NotificationManager(events)
{
    this.events = events;
    this.userManager = new UserManager(events);
}

NotificationManager.prototype.getNotifications = function (responseCallback, userID)
{
    if (!userID)
    {
        responseCallback(this.events.getNotifications.response.error, "You are not logged in.");
        return;
    }

    this.userManager.selectPlayerByID(userID, function (error, user)
    {
        if (error || !user)
        {
            console.log(error);
            responseCallback(this.events.getNotifications.response.error, "Unable to retrieve notifications.");
            return;
        }

        responseCallback(this.events.getNotifications.response.success, user.notifications);
    }.bind(this));
};

module.exports = NotificationManager;
