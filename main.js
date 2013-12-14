require(['Game/src/scheduler', 'renderer', 'Game/src/plotManager', 'Game/src/commandManager'],
    function (Scheduler, Renderer, PlotManager, CommandManager)
    {
        'use strict';
        function onDocumentReady()
        {
            Renderer.initialize(document.getElementById('canvas'));
            Scheduler.start();
            PlotManager.initialize();
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });