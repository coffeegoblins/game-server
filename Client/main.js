require(['Core/src/scheduler', 'Core/src/commandManager', 'Renderer/src/menus/mainMenu'],
    function (Scheduler, CommandManager, MainMenu)
    {
        'use strict';

        // Load the correct stylesheet
        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');

        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))
            link.setAttribute('href', 'styles-mobile.css');
        else
            link.setAttribute('href', 'styles-desktop.css');

        document.head.appendChild(link);

        window.addEventListener('error', function (e)
        {
            if (e.error)
            {
                console.log(e.error.message);
                console.log(e.error.stack);
            }
        });

        // Wait for device API libraries to load
        document.addEventListener("deviceready", function ()
        {
            // device APIs are available
        }, false);

        function onDocumentReady()
        {
            Scheduler.start();

            MainMenu.display();
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });
