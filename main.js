require(['Game/src/scheduler', 'renderer', 'Game/src/plotManager', 'Game/src/commandManager', 'jsonLoader'],
    function (Scheduler, Renderer, PlotManager, CommandManager, loadJSON)
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
        document.addEventListener("deviceready", function ()
        {
            // device APIs are available
        }, false);

        function onDocumentReady()
        {
            Renderer.initialize(document.getElementById('canvas'));
            Scheduler.start();

            loadJSON('weapons', function (weaponData)
            {
                PlotManager.initialize(weaponData);
            });
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });