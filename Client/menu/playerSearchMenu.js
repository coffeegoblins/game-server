define(['text!menu/playerSearchMenu.html', 'menu/menuNavigator', 'core/src/events'], function (PlayerSearchTemplate, MenuNavigator, Events)
{
    'use strict';

    function PlayerSearchMenu()
    {
    }

    PlayerSearchMenu.prototype.show = function (parentElement, searchResults)
    {
        MenuNavigator.insertTemplate(parentElement, PlayerSearchTemplate);

        this.searchResultsTable = document.getElementById('searchResults');

        // TODO: Optimize. Templates and fragments.
        for (var i = 0; i < searchResults.length; ++i)
        {
            var row = this.searchResultsTable.insertRow(i);

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            // TODO: Should we show the number of active games/challenges with the players?

            cell1.innerHTML = searchResults[i].username;
            cell2.innerHTML = "<input type='button' value='Challenge!' id='" + searchResults[i].username + "'>";

            document.getElementById(searchResults[i].username).addEventListener('click', this.challengePlayer.bind(this));
        }
    };

    PlayerSearchMenu.prototype.challengePlayer = function (e)
    {
        this.trigger('challengeDeclared', e.target.id);
    };

    Events.register(PlayerSearchMenu.prototype);
    return PlayerSearchMenu;
});
