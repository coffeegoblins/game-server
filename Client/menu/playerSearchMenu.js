define(['text!menu/playerSearchMenu.html', 'core/src/utility'],
    function (PlayerSearchTemplate, Utility)
    {
        'use strict';

        function PlayerSearchMenu(socket)
        {
            this.socket = socket;
        }

        PlayerSearchMenu.prototype.show = function (parentElement, searchResults)
        {
            Utility.insertTemplate(parentElement, PlayerSearchTemplate);

            this.searchResultsTable = document.getElementById('searchResults');

            for (var i = 0; i < searchResults.length; ++i)
            {
                var row = this.searchResultsTable.insertRow(i);

                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);

                cell1.innerHTML = searchResults[i].username;
                cell2.innerHTML = "<input type='button' value='Challenge!' id='" + searchResults[i].username + "'>";

                document.getElementById(searchResults[i].username).addEventListener('click', this.challengePlayer.bind(this));
            }
        };

        PlayerSearchMenu.prototype.challengePlayer = function (e)
        {
            // TODO Battle Config
            this.socket.emit(this.socket.events.challengeUser.name, e.target.id, "level1");
        };

        return PlayerSearchMenu;
    });
