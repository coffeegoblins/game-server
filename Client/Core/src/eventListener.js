define(['../../menu/notificationsMenu', '../../menu/activeGamesMenu'],
    function (NotificationMenu, ActiveGamesMenu)
    {
        return {
            listen: function (socket, listeners)
            {
                socket.on(listeners.notifications, NotificationMenu.onNotificationsReceived.bind(NotificationMenu));
                socket.on(listeners.gameCreations, ActiveGamesMenu.onGamesCreated.bind(ActiveGamesMenu));
                socket.on(listeners.gameUpdates, ActiveGamesMenu.onGamesUpdated.bind(ActiveGamesMenu));
            }
        };
    });
