define(['text!menu/activeGamesMenu.html', 'menu/menuNavigator', 'core/src/imageCache', 'core/src/events'],
    function (ActiveGamesTemplate, MenuNavigator, ImageCache, Events)
    {
        'use strict';

        function ActiveGamesMenu(socket, parentElement)
        {
            this.socket = socket;
            this.parentElement = parentElement;

            this.socket.on(this.socket.events.getGames.response.success, function (games)
            {
                var waitingOnYouGames = [];
                var waitingOnThemGames = [];

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
            for (var i = 0; i < game.waitingOn.length; ++i)
            {
                if (game.waitingOn[i].lowerCaseUsername === this.socket.user.lowerCaseUsername)
                {
                    return true;
                }
            }

            return false;
        };

        ActiveGamesMenu.prototype.show = function (parentElement)
        {
            this.parentElement = parentElement;

            this.socket.emit(this.socket.events.getGames.url);
        };

        ActiveGamesMenu.prototype.updateTemplate = function (waitingOnYouGames, waitingOnThemGames)
        {
            MenuNavigator.insertTemplate(this.parentElement, ActiveGamesTemplate);

            this.insertGames('waitingOnYouTable', waitingOnYouGames);
            this.insertGames('waitingOnThemTable', waitingOnThemGames);
        };

        ActiveGamesMenu.prototype.insertGames = function (tableID, games)
        {
            var table = document.getElementById(tableID);

            MenuNavigator.removeChildren(table);

            // TODO: Should probably optimize with a fragment
            for (var i = 0; i < games.length; ++i)
            {
                var game = games[i];

                var row = table.insertRow(i);
                var levelNameCell = row.insertCell(0);
                var opponentCell = row.insertCell(1);

                row.addEventListener('click', this.onGameClicked.bind(this, game));

                var levelImage = new Image();
                levelImage.className = 'levelThumbnail';
                ImageCache.bindImage(game.level, levelImage);

                levelNameCell.appendChild(levelImage);
                opponentCell.innerHTML = game.opponentUser.username;
            }
        };

        ActiveGamesMenu.prototype.onGameClicked = function (game)
        {
            this.trigger('gameClicked', game);
        };

        Events.register(ActiveGamesMenu.prototype);
        return ActiveGamesMenu;
    });
