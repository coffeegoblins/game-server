define(['text!menu/mainMenu.html', 'text!menu/mainMenuButtons.html', 'text!menu/searchBar.html',
        '../../Core/src/plotManager', './loginPopup', 'core/src/browserNavigation', 'text!menu/playerSearch.html', './battleConfiguration', './notificationsMenu', 'text!menu/games.html', 'core/src/localJSONLoader', 'core/src/remoteJSONLoader', 'core/src/levelLoader'],
    function (MainMenuTemplate, MainMenuButtonsTemplate, SearchBarTemplate, PlotManager, LoginPopup, BrowserNavigation, PlayerSearchTemplate, BattleConfiguration, Notifications, GamesTemplate, LocalJSONLoader, RemoteJSONLoader, LevelLoader)
    {
        'use strict';

        function parseFunctions(key, value)
        {
            if (typeof value === 'string' && value.length >= 8 && value.substring(0, 8) === 'function')
                return eval('(' + value + ')');

            return value;
        }

        function MainMenu()
        {
            BrowserNavigation.on('root', this.show.bind(this));
            BrowserNavigation.on('battleConfiguration', this.loadBattleConfiguration.bind(this));
            BrowserNavigation.on('singlePlayer', this.loadSinglePlayer.bind(this));

            this.loginPopup = new LoginPopup(this);
            this.localLevelLoader = new LevelLoader(new LocalJSONLoader());
        }

        MainMenu.prototype.show = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.className = 'main-menu';

            this.mainMenuBar = document.getElementById('mainMenuBar');
            this.mainMenuChains = document.getElementById('mainMenuChains');
            this.mainMenuContent = document.getElementById('content');
            this.mainMenuChains.innerHTML = MainMenuButtonsTemplate;

            this.mainMenuChains.on('click', '.menuItem p', this.onMenuItemClicked.bind(this));
            this.mainMenuChains.className = 'lowerChains';
        };

        MainMenu.prototype.hide = function ()
        {
            document.body.innerHTML = '';
        };

        MainMenu.prototype.onMenuItemClicked = function (e)
        {
            switch (e.target.id)
            {
                case 'singlePlayer':
                    this.mainMenuChains.className = 'raiseChains';
                    BrowserNavigation.addState('battleConfiguration');
                    this.loadBattleConfiguration();
                    break;
                case 'multiPlayer':
                    this.mainMenuChains.className = 'raiseChains';
                    setTimeout(function ()
                    {
                        this.loginPopup.show(this.onLoginSucceeded, this);
                    }.bind(this), 0);
                    break;
                case 'options':
                    break;
                case 'exit':
                    break;
            }
        };

        MainMenu.prototype.loadSinglePlayer = function (levelName, units)
        {
            document.body.className = 'game';
            while (document.body.lastChild)
                document.body.removeChild(document.body.lastChild);

            PlotManager.loadLevel(this.gameLogic, this.localLevelLoader, levelName, units);
        };

        MainMenu.prototype.loadBattleConfiguration = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.className = '';

            var levelLoader = this.socket ? this.remoteLevelLoader : this.localLevelLoader;
            var battleConfig = new BattleConfiguration(levelLoader).show();
            battleConfig.on('cancel', this, this.show);
            battleConfig.on('confirm', this, function (levelName, units)
            {
                BrowserNavigation.addState('singlePlayer');
                this.loadSinglePlayer(levelName, units);
            });
        };

        MainMenu.prototype.loadGameLogic = function ()
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
        };

        MainMenu.prototype.onLoginSucceeded = function (socket, user)
        {
            while (this.mainMenuChains.lastChild)
                this.mainMenuChains.removeChild(this.mainMenuChains.lastChild);

            this.mainMenuBar.innerHTML = SearchBarTemplate;
            this.mainMenuContent.innerHTML = GamesTemplate;

            document.getElementById('notificationsButton').addEventListener('click', this.onNotificationsButtonClicked.bind(this));
            document.getElementById('searchButton').addEventListener('click', this.onPlayerSearchButtonClicked.bind(this));

            this.socket = socket;
            this.user = user;
            this.notifications = new Notifications(socket);
            this.waitingOnYou = document.getElementById('waitingOnYou');
            this.waitingOnThem = document.getElementById('waitingOnThem');
            this.remoteLevelLoader = new LevelLoader(new RemoteJSONLoader(this.socket));

            this.loadGameLogic();
            this.socket.emit(this.socket.events.getNotifications.url);
            this.socket.emit(this.socket.events.getGames.url);

            this.socket.on(this.socket.events.getNotifications.response.success, function (notifications)
            {
                for (var i = 0; i < notifications.length; ++i)
                {
                    this.notifications.addNotification(notifications[i]);
                }
            }.bind(this));

            this.socket.on(this.socket.events.getGames.response.success, function (games)
            {
                for (var i = 0; i < games.length; ++i)
                {
                    var currentGame = games[i];

                    var li = document.createElement('li');
                    li.id = currentGame._id;

                    for (var j = 0; j < currentGame.users.length; ++j)
                    {
                        if (currentGame.waitingOn[j].lowerCaseUsername !== this.user.lowerCaseUsername)
                        {
                            li.innerHTML += currentGame.waitingOn[j].username;
                            li.addEventListener('click', this.onGameClicked.bind(this, currentGame));
                        }
                    }

                    for (var k = 0; k < currentGame.waitingOn.length; ++k)
                    {
                        if (currentGame.waitingOn[k].lowerCaseUsername === this.user.lowerCaseUsername)
                        {
                            this.waitingOnYou.appendChild(li);
                            return;
                        }
                    }

                    this.waitingOnThem.appendChild(li);
                    return;
                }
            }.bind(this));

            this.socket.on(this.socket.events.searchByUsername.response.success, function (cursor)
            {
                for (var x = this.searchResultsTable.rows.length - 1; x >= 0; --x)
                {
                    this.searchResultsTable.deleteRow(x);
                }

                for (var i = 0; i < cursor.length; ++i)
                {
                    var row = this.searchResultsTable.insertRow(i);

                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);

                    cell1.innerHTML = cursor[i].username;
                    cell1.className = "userName";
                    cell2.innerHTML = "<input type='button' value='Challenge!' id='" + cursor[i].username + "'>";

                    document.getElementById(cursor[i].username).addEventListener('click', this.onPlayerChallenged.bind(this));
                }
            }.bind(this));
        };

        MainMenu.prototype.onNotificationsButtonClicked = function ()
        {
            this.notifications.toggle();
        };

        MainMenu.prototype.onPlayerSearchButtonClicked = function ()
        {
            this.mainMenuChains.className = 'raiseChains';
            this.mainMenuContent.innerHTML = PlayerSearchTemplate;

            this.searchCriteria = document.getElementById('searchCriteria');
            this.searchResultsTable = document.getElementById('searchResultsTable');

            this.socket.emit(this.socket.events.searchByUsername.name, this.searchCriteria.value);
        };

        MainMenu.prototype.onPlayerChallenged = function (e)
        {
            this.mainMenuContent.innerHTML = "";

            var battleConfig = new BattleConfiguration(this.remoteLevelLoader).show();
            battleConfig.on('cancel', this, this.show);
            battleConfig.on('confirm', this, function (levelName, units)
            {
                var levelData = {name: levelName, units: units};
                this.socket.emit(this.socket.events.challengeUser.name, e.target.id, levelData);
            }.bind(this));
        };

        MainMenu.prototype.onGameClicked = function (game)
        {
            document.body.className = 'game';
            while (document.body.lastChild)
                document.body.removeChild(document.body.lastChild);

            PlotManager.loadLevel(this.gameLogic, this.remoteLevelLoader, 'level1', game.units);
        };

        return new MainMenu();
    });
