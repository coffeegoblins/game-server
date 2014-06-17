define(['text!menu/mainMenu.html', 'text!menu/mainMenuButtons.html', 'text!menu/searchBar.html',
        'core/src/plotManager', './loginPopup', 'core/src/browserNavigation', 'text!menu/playerSearch.html', './battleConfiguration', './notifications'],
    function (MainMenuTemplate, MainMenuButtonsTemplate, SearchBarTemplate, PlotManager, LoginPopup, BrowserNavigation, PlayerSearchTemplate, BattleConfiguration, Notifications)
    {
        'use strict';

        function MainMenu()
        {
            BrowserNavigation.on('root', this.show.bind(this));
            BrowserNavigation.on('battleConfiguration', this.loadBattleConfiguration.bind(this));
            BrowserNavigation.on('singlePlayer', this.loadSinglePlayer.bind(this));

            this.loginPopup = new LoginPopup(this);
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

            PlotManager.loadLevel(levelName, units);
        };

        MainMenu.prototype.loadBattleConfiguration = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.className = '';

            var battleConfig = new BattleConfiguration().show();
            battleConfig.on('cancel', this, this.show);
            battleConfig.on('confirm', this, function (levelName, units)
            {
                BrowserNavigation.addState('singlePlayer');
                this.loadSinglePlayer(levelName, units);
            });
        };

        MainMenu.prototype.onLoginSucceeded = function (socket, user)
        {
            while (this.mainMenuChains.lastChild)
                this.mainMenuChains.removeChild(this.mainMenuChains.lastChild);

            this.mainMenuBar.innerHTML = SearchBarTemplate;

            document.getElementById('notificationsButton').addEventListener('click', this.onNotificationsButtonClicked.bind(this));
            document.getElementById('searchButton').addEventListener('click', this.onPlayerSearchButtonClicked.bind(this));
            this.socket = socket;
            this.user = user;
            this.notifications = new Notifications(socket);

            this.socket.emit(this.socket.events.getNotifications.name);

            this.socket.on(this.socket.events.getNotifications.response.success, function (notifications)
            {
                for (var i = 0; i < notifications.length; ++i)
                {
                    this.notifications.addNotification(notifications[i]);
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
                    cell2.innerHTML = "<input type='button' value='Challenge!' id='" + cursor[i]._id + "'>";

                    document.getElementById(cursor[i]._id).addEventListener('click', this.onPlayerChallenged.bind(this));
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
            this.socket.emit(this.socket.events.challengeUser.name, e.target.id);
        };

        return new MainMenu();
    });
