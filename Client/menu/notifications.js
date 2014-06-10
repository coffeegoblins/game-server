define(['text!menu/notifications.html'],
    function (NotificationsTemplate)
    {
        'use strict';

        function Notifications()
        {
            this.notifications = [];
            this.div = document.createElement('div');
            this.div.id = 'notifications';
        }

        Notifications.prototype.toggle = function ()
        {
            var notificationsWrapper = document.getElementById('notificationsWrapper');
            if (!notificationsWrapper)
            {
                return;
            }

            if (this.div.parentNode)
            {
                // The div is in a visible state
                notificationsWrapper.removeChild(this.div);
                return;
            }

            // Show the div
            notificationsWrapper.appendChild(this.div);
        };

        Notifications.prototype.addNotification = function (notification)
        {
            var div = document.createElement('div');
            div.innerHTML = NotificationsTemplate;

            div.querySelector('.notificationTitle').innerHTML = notification.title;
            div.querySelector('.notificationMessage').innerHTML = notification.message;

            this.div.appendChild(div);

            this.notifications.push(div);
        };

        return new Notifications();
    });
