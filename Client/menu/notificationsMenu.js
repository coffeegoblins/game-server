define(['text!menu/notificationsMenu.html', 'text!menu/notification.html', 'core/src/utility'],
    function (NotificationsMenuTemplate, NotificationTemplate, Utility)
    {
        'use strict';

        function NotificationsMenu(socket)
        {
            this.socket = socket;
            this.notifications = [];

            this.socket.on(this.socket.events.getNotifications.response.success, this.onNotificationReceived.bind(this));
        }

        NotificationsMenu.prototype.show = function (parentElement)
        {
            this.parentElement = parentElement;

            Utility.insertTemplate(parentElement, NotificationsMenuTemplate);

            this.notificationsSideBar = document.getElementById('notifications');
            this.toggle();

            this.socket.emit(this.socket.events.getNotifications.name);
        };

        NotificationsMenu.prototype.toggle = function ()
        {
            if (this.notificationsSideBar.className)
            {
                this.notificationsSideBar.className = '';
                return;
            }

            this.notificationsSideBar.className = 'collapsed';
        };

        NotificationsMenu.prototype.onNotificationReceived = function (notifications)
        {
            for (var i = 0; i < notifications.length; ++i)
            {
                var notification = notifications[i];

                var div = document.createElement('div');
                Utility.insertTemplate(div, NotificationTemplate);

                div.querySelector('.userName').innerHTML = notification.sourceUserName;
                div.querySelector('.levelName').innerHTML = notification.data;
                div.querySelector('.acceptButton').addEventListener('click', this.acceptChallenge.bind(this, notification));
                div.querySelector('.declineButton').addEventListener('click', this.declineChallenge.bind(this, notification));

                this.notificationsSideBar.appendChild(div);

                this.notifications[notification._id] = div;
            }
        };

        NotificationsMenu.prototype.removeNotification = function (id)
        {
            if (this.notifications[id])
            {
                this.notificationsSideBar.removeChild(this.notifications[id]);
                delete this.notifications[id];
            }
        };

        NotificationsMenu.prototype.acceptChallenge = function (notification)
        {
            this.socket.emit(this.socket.events.challengeAccepted.name, notification._id);

            this.socket.on(this.socket.events.challengeAccepted.response.success, function ()
            {
                this.removeNotification(notification._id);
            }.bind(this));
        };

        NotificationsMenu.prototype.declineChallenge = function (notification)
        {
            this.socket.emit(this.socket.events.challengeDeclined.name, notification._id);
            this.removeNotification(notification._id);
        };

        return NotificationsMenu;
    });
