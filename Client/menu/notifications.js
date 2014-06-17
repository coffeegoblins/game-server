define(['text!menu/notifications.html'],
    function (NotificationsTemplate)
    {
        'use strict';

        function Notifications(socket)
        {
            this.socket = socket;
            this.notifications = [];
            this.notificationsDiv = document.createElement('div');
            this.notificationsDiv.id = 'notifications';
        }

        Notifications.prototype.toggle = function ()
        {
            var notificationsWrapper = document.getElementById('notificationsWrapper');
            if (!notificationsWrapper)
            {
                return;
            }

            if (this.notificationsDiv.parentNode)
            {
                // The div is in a visible state, hide it
                notificationsWrapper.removeChild(this.notificationsDiv);
                return;
            }

            // Show the div
            notificationsWrapper.appendChild(this.notificationsDiv);
        };

        Notifications.prototype.addNotification = function (notification)
        {
            var div = document.createElement('div');
            div.innerHTML = NotificationsTemplate;

            div.querySelector('.notificationTitle').innerHTML = "Challenged by";
            div.querySelector('.notificationMessage').innerHTML = notification.sourceUserName;

            var acceptButton = div.querySelector('.acceptButton');
            acceptButton.addEventListener('click', this.onAcceptButtonClicked.bind(this, notification._id, acceptButton));

            div.querySelector('.declineButton').addEventListener('click', this.onDeclineButtonClicked.bind(this, notification._id));

            this.notificationsDiv.appendChild(div);

            this.notifications[notification._id] = div;
        };

        Notifications.prototype.removeNotification = function (id)
        {
            if (this.notifications[id])
            {
                this.notificationsDiv.removeChild(this.notifications[id]);
                delete this.notifications[id];
            }
        };

        Notifications.prototype.onAcceptButtonClicked = function (id, acceptButton)
        {
            acceptButton.disabled = true;

            this.socket.emit(this.socket.events.challengeAccepted.name, id);

            this.socket.on(this.socket.events.challengeAccepted.response.success, function ()
            {
                this.removeNotification(id);

                // TODO Start multiplayer game
            }.bind(this));

            this.socket.on(this.socket.events.challengeAccepted.response.error, function (error)
            {
                acceptButton.disabled = false;
            });
        };

        Notifications.prototype.onDeclineButtonClicked = function (id)
        {
            this.socket.emit(this.socket.events.challengeDeclined.name, id);
            this.removeNotification(id);
        };

        return Notifications;
    });
