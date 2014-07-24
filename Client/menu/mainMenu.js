define(['menu/loginMenu', 'menu/multiplayerMenu', 'menu/menuNavigator'],
    function (LoginMenu, MultiplayerMenu, MenuNavigator)
    {
        var SERVER_URL = 'http://127.0.0.1:1988';

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
                        socket.on(events.disconnect.url, this.onDisconnected.bind(this));

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
