define(['menu/loginMenu', 'menu/multiplayerMenu', 'menu/menuNavigator', 'core/src/eventListener'],
    function (LoginMenu, MultiplayerMenu, MenuNavigator, EventListener)
    {
        return {
            show: function (parentElement)
            {
                this.parentElement = parentElement;

                MenuNavigator.removeChildren(this.parentElement);
                LoginMenu.show(this.parentElement, this.onLoggedIn.bind(this));
            },

            onLoggedIn: function (socket)
            {
                socket.on('events', function (events)
                {
                    socket.events = events;

                    socket.on(events.connection.response.userInfo, function (user)
                    {
                        socket.user = user;
                        socket.on(events.listeners.disconnect, this.onDisconnected.bind(this));

                        // TODO Cache manager

                        EventListener.listen(socket, events.listeners);

                        MenuNavigator.removeChildren(this.parentElement);
                        MultiplayerMenu.show(this.parentElement, socket);
                    }.bind(this));

                }.bind(this));
            },

            onDisconnected: function ()
            {
                localStorage.removeItem('token');

                this.show(this.parentElement);
            },
        };
    });
