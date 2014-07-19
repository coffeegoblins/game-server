define([
        'text!menu/multiplayerMenu.html',
        'menu/menuNavigator',
        'menu/loginMenu',
        'menu/playerSearchMenu',
        'menu/activeGamesMenu',
        'menu/notificationsMenu'
    ],
    function (Template, MenuNavigator, LoginMenu, PlayerSearchMenu, ActiveGamesMenu, NotificationsMenu)
    {
        return {
            show: function (parentElement)
            {
                if (!this.socket || !this.socket.connected)
                {
                    MenuNavigator.removeChildren(parentElement);
                    LoginMenu.show(parentElement, function (socket)
                    {
                        this.socket = socket;
                        this.show(parentElement);
                    }.bind(this));

                    return;
                }

                this.parentElement = parentElement;
                this.playerSearchMenu = new PlayerSearchMenu(this.socket);
                this.activeGamesMenu = new ActiveGamesMenu(this.socket);
                this.notificationsMenu = new NotificationsMenu(this.socket);

                MenuNavigator.insertTemplate(parentElement, Template);

                this.content = document.getElementById('content');
                this.searchCriteria = document.getElementById('searchCriteria');
                this.searchButton = document.getElementById('searchButton');
                this.logoutButton = document.getElementById('logoutButton');
                this.notificationsButton = document.getElementById('notificationsButton');

                this.searchButton.addEventListener('click', this.searchForPlayer.bind(this));
                this.logoutButton.addEventListener('click', this.disconnect.bind(this));
                this.notificationsButton.addEventListener('click', this.notificationsMenu.toggle.bind(this.notificationsMenu, this.parentElement));

                this.activeGamesMenu.show(this.content);
                this.notificationsMenu.show(this.parentElement);

                this.socket.on(this.socket.events.disconnect.name, this.onDisconnected.bind(this));
                this.socket.on(this.socket.events.searchByUsername.response.success, this.onSearchCompleted.bind(this));
                this.socket.on(this.socket.events.getLevels.response.success, this.onGetLevelsCompleted.bind(this));
            },

            onGetLevelsCompleted: function (levels)
            {

            },

            searchForPlayer: function ()
            {
                // TODO: Can't search for all players? Searching for '*' throws an exception
                if (!this.searchCriteria.value)
                {
                    MenuNavigator.removeChildren(this.content);
                    this.activeGamesMenu.show(this.content);
                    return;
                }

                this.searchCriteria.disabled = true;
                this.searchButton.disabled = true;

                this.socket.emit(this.socket.events.searchByUsername.name, this.searchCriteria.value);
            },

            onSearchCompleted: function (cursor)
            {
                MenuNavigator.removeChildren(this.content);

                this.notificationsMenu.hide();
                this.playerSearchMenu.show(this.content, cursor);

                this.searchCriteria.disabled = false;
                this.searchButton.disabled = false;
            },

            onDisconnected: function ()
            {
                localStorage.removeItem('token');
                this.show(this.parentElement);
            },

            disconnect: function ()
            {
                this.socket.disconnect();
            }
        };
    });
