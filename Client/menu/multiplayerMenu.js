define(['text!menu/multiplayerMenu.html', 'menu/menuNavigator', 'core/src/utility',
        'menu/loginMenu', 'menu/playerSearchMenu', 'menu/activeGamesMenu'],
    function (Template, MenuNavigator, Utility,
        LoginMenu, PlayerSearchMenu, ActiveGamesMenu)
    {
        return {
            show: function (parentElement)
            {
                this.parentElement = parentElement;

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

                this.playerSearchMenu = new PlayerSearchMenu(this.socket);
                this.activeGamesMenu = new ActiveGamesMenu(this.socket);

                this.socket.on(this.socket.events.disconnect.name, this.onDisconnected.bind(this));

                Utility.insertTemplate(parentElement, Template);

                this.content = document.getElementById('content');
                this.searchCriteria = document.getElementById('searchCriteria');
                this.searchButton = document.getElementById('searchButton');
                this.logoutButton = document.getElementById('logoutButton');

                this.searchButton.addEventListener('click', this.searchForPlayer.bind(this));
                this.logoutButton.addEventListener('click', this.disconnect.bind(this));

                this.socket.on(this.socket.events.searchByUsername.response.success, this.onSearchCompleted.bind(this));

                this.activeGamesMenu.show(this.content);
            },

            searchForPlayer: function ()
            {
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
