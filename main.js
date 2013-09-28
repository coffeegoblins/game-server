require(['Game/src/scheduler', 'renderer', 'Game/src/plotManager', 'Game/src/commandManager'],
    function (Scheduler, Renderer, PlotManager, CommandManager)
    {
        'use strict';
        function onDocumentReady()
        {
            // TODO: We're going to need to preload stuff once we have actual content
            var canvas = document.getElementById('canvas');

            Renderer.initialize(canvas);
            Scheduler.start();
            PlotManager.initialize();
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });