define(['../../menu/notificationsMenu'],
       function (NotificationMenu)
{
    return {
        listen: function (socket, listeners)
        {
            socket.on(listeners.notifications, NotificationMenu.onNotificationsReceived.bind(NotificationMenu));
        }
    };
});
