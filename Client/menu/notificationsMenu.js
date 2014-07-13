define(['text!menu/notificationsMenu.html', 'core/src/utility'],
    function (NotificationsTemplate, Utility)
    {
        'use strict';

        function NotificationsMenu(socket)
        {
            this.socket = socket;
        }

        NotificationsMenu.prototype.show = function (parentElement)
        {
            Utility.insertTemplate(parentElement, NotificationsTemplate);
        };

        return NotificationsMenu;
    });
