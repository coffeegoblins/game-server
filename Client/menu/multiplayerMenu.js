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
        function parseFunctions(key, value)
        {
            if (typeof value === 'string' && value.length >= 8 && value.substring(0, 8) === 'function')
                return eval('(' + value + ')');

            return value;
        }

        return {
            show: function (parentElement, socket)
            {
                this.levels = {};
                this.socket = socket;
                this.parentElement = parentElement;

                this.loadGameLogic();
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
                this.activeGamesMenu.on('gameClicked', this, this.launchGame);

                this.activeGamesMenu.show(this.content);
                this.notificationsMenu.show(this.parentElement);

                this.socket.emit(this.socket.events.getLevels.url);
                this.socket.on(this.socket.events.searchByUsername.response.success, this.onSearchCompleted.bind(this));
                this.socket.on(this.socket.events.getLevels.response.success, this.onGetLevelsCompleted.bind(this));
            },

            disconnect: function ()
            {
                this.socket.disconnect();
            },

            launchGame: function (game)
            {
                document.body.className = 'game';
                while (document.body.lastChild)
                    document.body.removeChild(document.body.lastChild);

                var levelData = this.levels[game.level];
                PlotManager.loadLevel(this.socket, this.gameLogic, levelData, game.users);
            },

            loadGameLogic: function ()
            {
                var gameLogicVersion;
                var serializedGameLogic = window.localStorage.getItem('gameLogic');
                if (serializedGameLogic)
                {
                    this.gameLogic = JSON.parse(serializedGameLogic, parseFunctions);
                    gameLogicVersion = this.gameLogic.version;
                }

                this.socket.emit(this.socket.events.getGameLogic.url, gameLogicVersion);
                this.socket.on(this.socket.events.getGameLogic.response.success, function (gameLogic)
                {
                    if (gameLogic)
                    {
                        window.localStorage.setItem('gameLogic', gameLogic);
                        this.gameLogic = JSON.parse(gameLogic, parseFunctions);
                    }
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
                            this.levels[level.name] = data;
                            Renderer.createLevelImage(level.name, data);
                        }.bind(this));
                    }
                }
            },

            onChallengeAccepted: function (id, levelName, onSuccess)
            {
                this.showBattleConfigurationMenu(levelName, function (levelData)
                {
                    this.socket.emit(this.socket.events.challengeAccepted.url, id, levelData);
                    this.socket.on(this.socket.events.createGame.response.success, function (game)
                    {
                        onSuccess();
                        this.launchGame(game);
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
