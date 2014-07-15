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

                    for (var j = 0; j < currentGame.users.length; ++j)
                    {
                        var user = currentGame.waitingOn[j];

                        if (user.lowerCaseUsername !== this.socket.user.lowerCaseUsername)
                        {
                            currentGame.opponentUser = user;
                        }
                    }

                    if (this.isWaitingOnUser(currentGame))
                    {
                        waitingOnYouGames.push(currentGame);
                        continue;
                    }

                    waitingOnThemGames.push(currentGame);
                }

                this.updateTemplate(waitingOnYouGames, waitingOnThemGames);
            }.bind(this));
        }

        ActiveGamesMenu.prototype.isWaitingOnUser = function (game)
        {
            for (var k = 0; k < game.waitingOn.length; ++k)
            {
                if (game.waitingOn[k].lowerCaseUsername === this.socket.user.lowerCaseUsername)
                {
                    return true;
                }
            }

            return false;
        };

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

                row.id = game._id;
                levelNameCell.innerHTML = game.level;
                opponentCell.innerHTML = game.opponentUser.username;
            }
        };

        return ActiveGamesMenu;
    });
