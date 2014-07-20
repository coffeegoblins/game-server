define([
        './activeGamesMenu',
        './battleConfigurationMenu',
        './loginMenu',
        './menuNavigator',
        './notificationsMenu',
        './playerSearchMenu',
        'text!./multiplayerMenu.html'
    ],
    function (ActiveGamesMenu, BattleConfigurationMenu, LoginMenu, MenuNavigator, NotificationsMenu, PlayerSearchMenu, Template)
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
                MenuNavigator.insertTemplate(parentElement, Template);

                this.activeGamesMenu = new ActiveGamesMenu(this.socket);
                this.notificationsMenu = new NotificationsMenu(this.socket);
                this.playerSearchMenu = new PlayerSearchMenu();

                this.notificationsMenu.on('challengeAccepted', this, this.onChallengeAccepted);
                this.playerSearchMenu.on('challengeDeclared', this, this.onChallengeDeclared);

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


            disconnect: function ()
            {
                this.socket.disconnect();
            },

            onChallengeAccepted: function (id, levelName, onSuccess)
            {
                this.showBattleConfigurationMenu(levelName, function (levelData)
                {
                    this.socket.emit(this.socket.events.challengeAccepted.name, id, levelData);
                    this.socket.on(this.socket.events.challengeAccepted.response.success, function ()
                    {
                        onSuccess();
                        //PlotManager.loadLevel(this.gameLogic, this.remoteLevelLoader, levelData);
                    }.bind(this));
                });
            },

            onChallengeDeclared: function (userId)
            {
                this.showBattleConfigurationMenu(null, function (levelData)
                {
                    this.socket.emit(this.socket.events.challengeUser.name, userId, levelData);
                    this.parentElement.style.display = '';
                });
            },

            onDisconnected: function ()
            {
                localStorage.removeItem('token');
                this.show(this.parentElement);
            },

            onGetLevelsCompleted: function (levels)
            {

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

                this.socket.emit(this.socket.events.searchByUsername.name, this.searchCriteria.value);
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
