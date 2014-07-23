define([
        'text!menu/multiplayerMenu.html',
        'menu/menuNavigator',
        'menu/battleConfigurationMenu',
        'menu/loginMenu',
        'menu/playerSearchMenu',
        'menu/activeGamesMenu',
        'menu/notificationsMenu',
        'core/src/levelLoader',
        'core/src/plotManager',
        'renderer/src/renderer'
    ],
    function (Template, MenuNavigator, BattleConfigurationMenu, LoginMenu, PlayerSearchMenu, ActiveGamesMenu, NotificationsMenu, LevelLoader, PlotManager, Renderer)
    {
        return {
            show: function (parentElement)
            {
                LoginMenu.show(parentElement, function (socket)
                {
                    this.parentElement = parentElement;
                    this.socket = socket;

                    MenuNavigator.insertTemplate(parentElement, Template);

                    this.activeGamesMenu = new ActiveGamesMenu(this.socket);
                    this.notificationsMenu = new NotificationsMenu(this.socket);
                    this.playerSearchMenu = new PlayerSearchMenu();

                    this.content = document.getElementById('content');
                    this.searchCriteria = document.getElementById('searchCriteria');
                    this.searchButton = document.getElementById('searchButton');
                    this.logoutButton = document.getElementById('logoutButton');
                    this.notificationsButton = document.getElementById('notificationsButton');

                    this.searchButton.addEventListener('click', this.searchForPlayer.bind(this));
                    this.logoutButton.addEventListener('click', this.disconnect.bind(this));
                    this.notificationsButton.addEventListener('click', this.notificationsMenu.toggle.bind(this.notificationsMenu, this.parentElement));

                    this.notificationsMenu.on('challengeAccepted', this, this.onChallengeAccepted);
                    this.playerSearchMenu.on('challengeDeclared', this, this.onChallengeDeclared);

                    this.activeGamesMenu.show(this.content);
                    this.notificationsMenu.show(this.parentElement);

                    this.socket.emit(this.socket.events.getLevels.url);
                    this.socket.on(this.socket.events.disconnect.url, this.onDisconnected.bind(this));
                    this.socket.on(this.socket.events.searchByUsername.response.success, this.onSearchCompleted.bind(this));
                    this.socket.on(this.socket.events.getLevels.response.success, this.onGetLevelsCompleted.bind(this));
                }.bind(this));
            },

            onGetLevelsCompleted: function (levels)
            {
                if (levels)
                {
                    var levelLoader = new LevelLoader();
                    for (var i = 0; i < levels.length; ++i)
                    {
                        var level = levels[i];
                        levelLoader.onLevelLoaded(level.data, function (data)
                        {
                            Renderer.createLevelImage(level.name, data);
                        });
                    }
                }
            },

            disconnect: function ()
            {
                this.socket.disconnect();
            },

            onChallengeAccepted: function (id, levelName, onSuccess)
            {
                this.showBattleConfigurationMenu(levelName, function (levelData)
                {
                    this.socket.emit(this.socket.events.challengeAccepted.url, id, levelData);
                    this.socket.on(this.socket.events.createGame.response.success, function (data)
                    {
                        onSuccess();
                        //PlotManager.loadLevel(this.socket, this.gameLogic, data.level, data.units);
                    }.bind(this));
                });
            },

            onChallengeDeclared: function (userId)
            {
                this.showBattleConfigurationMenu(null, function (levelData)
                {
                    this.socket.emit(this.socket.events.challengeUser.url, userId, levelData);
                    this.parentElement.style.display = '';
                });
            },

            onDisconnected: function ()
            {
                localStorage.removeItem('token');
                this.show(this.parentElement);
            },

            onSearchCompleted: function (cursor)
            {
                MenuNavigator.removeChildren(this.content);

                this.notificationsMenu.hide();
                this.playerSearchMenu.show(this.content, cursor);

                this.searchCriteria.disabled = false;
                this.searchButton.disabled = false;
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

                this.socket.emit(this.socket.events.searchByUsername.url, this.searchCriteria.value);
            },

            showBattleConfigurationMenu: function (levelName, callback)
            {
                this.parentElement.style.display = 'none';

                var battleConfig = new BattleConfigurationMenu(this.socket);
                battleConfig.on('cancel', this, function ()
                {
                    this.parentElement.style.display = '';
                });

                battleConfig.on('confirm', this, callback);
                battleConfig.show(levelName);
            }
        };
    });
