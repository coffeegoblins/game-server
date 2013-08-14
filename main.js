require(['Game/src/scheduler', 'Renderer/canvas/renderer', 'Game/src/map', 'Game/src/levelLoader'], function (Scheduler, Renderer, Map, LevelLoader)
{
    'use strict';
    function onDocumentReady()
    {
        // TODO: We're going to need to preload stuff once we have actual content

        Renderer.initialize(document.getElementById('canvas'));
        Scheduler.start();
        LevelLoader.loadLevel("");
    }

    if (document.readyState === 'complete')
        onDocumentReady();
    else
        window.addEventListener('load', onDocumentReady, false);
});