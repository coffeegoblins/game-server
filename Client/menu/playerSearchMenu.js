define(['text!menu/playerSearchMenu.html', 'core/src/utility'],
    function (PlayerSearchTemplate, Utility)
    {
        'use strict';

        function PlayerSearchMenu(socket)
        {
            this.socket = socket;
        }

        PlayerSearchMenu.prototype.show = function (parentElement)
        {
            Utility.insertTemplate(parentElement, PlayerSearchTemplate);
        };

        return PlayerSearchMenu;
    });
