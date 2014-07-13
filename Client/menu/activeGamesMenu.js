define(['text!menu/activeGamesMenu.html', 'core/src/utility', 'menu/menuNavigator'],
    function (ActiveGamesTemplate, Utility, MenuNavigator)
    {
        'use strict';

        function ActiveGamesMenu(socket)
        {
            this.socket = socket;

            var waitingOnYouGames = [];
            var waitingOnThemGames = [];

            this.socket.on(this.socket.events.getGames.response.success, function (games)
            {
                for (var i = 0; i < games.length; ++i)
                {
                    var currentGame = games[i];
                    var opponentUser = null;

                    for (var j = 0; j < currentGame.users.length; ++j)
                    {
                        var user = currentGame.waitingOn[j];

                        if (user.lowerCaseUsername !== this.socket.user.lowerCaseUsername)
                        {
                            opponentUser = user;
                        }
                    }

                    var gameListing = {
                        game: currentGame,
                        opponentUser: opponentUser
                    };

                    for (var k = 0; k < currentGame.waitingOn.length; ++k)
                    {
                        if (currentGame.waitingOn[k].lowerCaseUsername === this.socket.user.lowerCaseUsername)
                        {
                            waitingOnYouGames.push(gameListing);
                            gameListing = null;
                        }
                    }

                    if (gameListing)
                    {
                        waitingOnThemGames.push(gameListing);
                    }

                    this.updateTemplate(waitingOnYouGames, waitingOnThemGames);
                }
            }.bind(this));
        }

        ActiveGamesMenu.prototype.show = function (parentElement)
        {
            this.parentElement = parentElement;

            this.socket.emit(this.socket.events.getGames.name);
        };

        ActiveGamesMenu.prototype.updateTemplate = function (waitingOnYouGames, waitingOnThemGames)
        {
            Utility.insertTemplate(this.parentElement, ActiveGamesTemplate);

            this.insertGames('waitingOnYouTable', waitingOnYouGames);
            this.insertGames('waitingOnThemTable', waitingOnThemGames);
        };

        ActiveGamesMenu.prototype.insertGames = function (tableID, games)
        {
            var table = document.getElementById(tableID);

            MenuNavigator.removeChildren(table);

            for (var i = 0; i < games.length; ++i)
            {
                var game = games[i];

                var row = table.insertRow(i);
                var levelNameCell = row.insertCell(0);
                var opponentCell = row.insertCell(1);

                levelNameCell.innerHTML = game.level;
                opponentCell.innerHTML = game.opponentUser.username;
            }
        };

        return ActiveGamesMenu;
    });
