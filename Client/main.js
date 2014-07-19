require(['core/src/domEvents', 'core/src/scheduler', 'core/src/commandManager', 'menu/menuNavigator', 'menu/multiplayerMenu'],
    function (DomEvents, Scheduler, CommandManager, MenuNavigator, MultiplayerMenu)
    {
        'use strict';
        window.addEventListener('error', function (e)
        {
            if (e.error)
            {
                console.log(e.error.message);
                console.log(e.error.stack);
            }
        });

        // Wait for device API libraries to load
        document.addEventListener('deviceready', function ()
        {
            // device APIs are available
        }, false);

        function onDocumentReady()
        {
            Scheduler.start();
            var parentElement = MenuNavigator.createContentDiv();
            MultiplayerMenu.show(parentElement);
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });
