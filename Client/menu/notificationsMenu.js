define(['text!menu/notificationsMenu.html', 'text!menu/notification.html', 'menu/menuNavigator',
        'core/src/events', 'core/src/imageCache'],
    function (NotificationsMenuTemplate, NotificationTemplate, MenuNavigator, Events, ImageCache)
    {
        'use strict';

        function NotificationsMenu(socket)
        {
            this.socket = socket;
            this.socket.on(this.socket.events.getNotifications.response.success, this.onNotificationReceived.bind(this));
        }

        NotificationsMenu.prototype.hide = function ()
        {
            this.notificationsSideBar.className = 'collapsed';
        };

        NotificationsMenu.prototype.show = function (parentElement)
        {
            this.parentElement = parentElement;
            MenuNavigator.insertTemplate(parentElement, NotificationsMenuTemplate);

            this.notificationsSideBar = document.getElementById('notifications');
            this.notificationsSideBar.on('click', '.acceptButton', this.acceptChallenge.bind(this));
            this.notificationsSideBar.on('click', '.declineButton', this.declineChallenge.bind(this));

            this.toggle();
            this.socket.emit(this.socket.events.getNotifications.url);
        };

        NotificationsMenu.prototype.toggle = function ()
        {
            if (this.notificationsSideBar.className)
            {
                this.notificationsSideBar.className = '';
            }
            else
            {
                this.notificationsSideBar.className = 'collapsed';
            }
        };

        NotificationsMenu.prototype.onNotificationReceived = function (notifications)
        {
            var fragment = document.createDocumentFragment();
            for (var i = 0; i < notifications.length; ++i)
            {
                var notification = notifications[i];
                var div = document.createElement('div');
                MenuNavigator.insertTemplate(div, NotificationTemplate);

                div.setAttribute('data-id', notification._id);
                div.querySelector('.userName').textContent = notification.sourceUserName;
                div.querySelector('.levelName').textContent = notification.data;

                ImageCache.bindImage(notification.data, div.querySelector('.levelImage'));

                fragment.appendChild(div);
            }

            this.notificationsSideBar.appendChild(fragment);
        };

        NotificationsMenu.prototype.acceptChallenge = function (e)
        {
            var element = MenuNavigator.findParentElement(e.target, '[data-id]');
            var id = element.getAttribute('data-id');
            var levelName = element.querySelector('.levelName').textContent.trim();

            // TODO: Disable buttons while waiting for response?

            this.trigger('challengeAccepted', id, levelName, function ()
            {
                this.socket.emit(this.socket.events.challengeAccepted.url, notification._id);
                if (element.parentNode)
                {
                    element.parentElement.removeChild(element);
                }
            }.bind(this));
        };

        NotificationsMenu.prototype.declineChallenge = function (e)
        {
            var notificationElement = MenuNavigator.findParentElement(e.target, '[data-id]');
            var id = notificationElement.getAttribute('data-id');

            // TODO: What happens on error?

            this.socket.emit(this.socket.events.challengeDeclined.url, id);
            this.notificationsSideBar.removeChild(notificationElement);
        };

        Events.register(NotificationsMenu.prototype);
        return NotificationsMenu;
    });
