define(['text!menu/lobbyMenu.html', 'text!menu/playerSearch.html', 'lib/socket.io'],
    function (LobbyTemplate, PlayerSearchTemplate, io)
    {
        function LobbyMenu(socket)
        {
            this.socket = socket;

            this.socket.on('search_succeeded', function (cursor)
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
                    cell2.innerHTML = "<input type='button' value='Challenge!'>";
                }
            }.bind(this));
        }

        LobbyMenu.prototype.show = function ()
        {
            document.body.innerHTML = LobbyTemplate;

            document.getElementById('notificationsButton').addEventListener('click', this.onNotificationButtonClicked.bind(this));
            document.getElementById('waitingOnYouButton').addEventListener('click', this.onWaitingOnYouButtonClicked.bind(this));
            document.getElementById('waitingOnThemButton').addEventListener('click', this.onWaitingOnThemButtonClicked.bind(this));
            document.getElementById('playerSearchButton').addEventListener('click', this.onPlayerSearchButtonClicked.bind(this));

            this.content = document.getElementById('content');

            this.mainMenuChains = document.getElementById('mainMenuChains');
            this.mainMenuChains.className = 'lowerChains';
        };

        LobbyMenu.prototype.hide = function ()
        {
            document.body.innerHTML = '';
        };

        LobbyMenu.prototype.onPlayerSearchButtonClicked = function ()
        {
            this.mainMenuChains.className = 'raiseChains';
            this.content.innerHTML += PlayerSearchTemplate;
            this.searchCriteria = document.getElementById('searchCriteria');
            this.searchResultsTable = document.getElementById('searchResultsTable');

            document.getElementById('searchButton').addEventListener('click', this.onSearchButtonClicked.bind(this));
        };

        LobbyMenu.prototype.onNotificationButtonClicked = function ()
        {

        };

        LobbyMenu.prototype.onWaitingOnYouButtonClicked = function ()
        {

        };

        LobbyMenu.prototype.onWaitingOnThemButtonClicked = function ()
        {

        };

        LobbyMenu.prototype.onSearchButtonClicked = function ()
        {
            this.socket.emit('playerSearch', this.searchCriteria.value);
        };

        return LobbyMenu;
    });
