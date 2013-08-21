require(['Game/src/scheduler', 'renderer', 'Game/src/map', 'Game/src/levelLoader', 'Game/src/commandManager'],
    function (Scheduler, Renderer, Map, LevelLoader, CommandManager)
    {
        'use strict';
        function onDocumentReady()
        {
            // TODO: We're going to need to preload stuff once we have actual content
            var canvas = document.getElementById('canvas');

            Renderer.initialize(canvas);
            Scheduler.start();
            LevelLoader.loadLevel();
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });