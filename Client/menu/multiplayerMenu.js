define(['text!menu/multiplayerMenu.html', 'menu/menuNavigator', 'core/src/utility',
        'menu/loginMenu', 'menu/playerSearchMenu', 'menu/activeGamesMenu',
        'menu/notificationsMenu', 'core/src/levelLoader', 'renderer/src/renderer', 'core/src/imageCache'],
    function (Template, MenuNavigator, Utility,
        LoginMenu, PlayerSearchMenu, ActiveGamesMenu,
        NotificationsMenu, LevelLoader, Renderer, ImageCache)
    {
        return {
            show: function (parentElement)
            {
                this.parentElement = parentElement;

                LoginMenu.show(parentElement, function (socket)
                {
                    this.socket = socket;

                    this.playerSearchMenu = new PlayerSearchMenu(this.socket);
                    this.activeGamesMenu = new ActiveGamesMenu(this.socket);
                    this.notificationsMenu = new NotificationsMenu(this.socket);

                    Utility.insertTemplate(parentElement, Template);

                    this.content = document.getElementById('content');
                    this.searchCriteria = document.getElementById('searchCriteria');
                    this.searchButton = document.getElementById('searchButton');
                    this.logoutButton = document.getElementById('logoutButton');
                    this.notificationsButton = document.getElementById('notificationsButton');
                    this.sideBar = document.getElementById('sideBar');

                    this.searchButton.addEventListener('click', this.searchForPlayer.bind(this));
                    this.logoutButton.addEventListener('click', this.disconnect.bind(this));
                    this.notificationsButton.addEventListener('click', this.notificationsMenu.toggle.bind(this.notificationsMenu, this.parentElement));

                    this.activeGamesMenu.show(this.content);
                    this.notificationsMenu.show(this.parentElement);
                    this.levelLoader = new LevelLoader();

                    this.socket.emit(this.socket.events.getLevels.url);

                    this.socket.on(this.socket.events.disconnect.url, this.onDisconnected.bind(this));
                    this.socket.on(this.socket.events.searchByUsername.response.success, this.onSearchCompleted.bind(this));
                    this.socket.on(this.socket.events.getLevels.response.success, this.onGetLevelsCompleted.bind(this));
                }.bind(this));
            },

            onGetLevelsCompleted: function (levels)
            {
                for (var i = 0; i < 1; ++i)
                {
                    var level = levels[i];

                    this.levelLoader.onLevelLoaded(level.data, function (data)
                    {
                        Renderer.createLevelImage(level.name, data, function ()
                        {
                            var elements = document.getElementsByClassName(level.name);

                            for (var j = 0; j < elements.length; ++j)
                            {
                                elements[j].innerHTML = '<img src="' + ImageCache.getImage(level.name).path + '" class="levelThumbnail" />';
                            }
                        });
                    });
                }
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

                this.socket.emit(this.socket.events.searchByUsername.url, this.searchCriteria.value);
            },

            onSearchCompleted: function (cursor)
            {
                MenuNavigator.removeChildren(this.content);

                this.playerSearchMenu.show(this.content, cursor);

                this.searchCriteria.disabled = false;
                this.searchButton.disabled = false;
            },

            toggleSideBar: function ()
            {
                if (this.sideBar.className)
                {
                    this.sideBar.className = "";
                    return;
                }

                this.sideBar.className = 'collapsed';
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
