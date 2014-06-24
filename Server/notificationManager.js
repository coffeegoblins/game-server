var UserManager = require('./userManager');

function NotificationManager(events)
{
    this.events = events;
    this.userManager = new UserManager(events);
}

NotificationManager.prototype.getNotifications = function (responseCallback, userName)
{
    console.log("Getting notifications for: " + userName);

    if (!userName)
    {
        responseCallback(this.events.getNotifications.response.error, "You are not logged in.");
        return;
    }

    this.userManager.selectPlayer(userName, function (error, user)
    {
        if (error || !user)
        {
            console.log(error);
            responseCallback(this.events.getNotifications.response.error, "Unable to retrieve notifications.");
            return;
        }

        console.log(user);
        responseCallback(this.events.getNotifications.response.success, user.notifications);
    }.bind(this));
};

module.exports = NotificationManager;
