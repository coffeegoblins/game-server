require(['core/scheduler', 'Render/canvas/renderer', 'maps/map'], function (Scheduler, Renderer, Map)
{
    'use strict';
    function onDocumentReady()
    {
        // TODO: We're going to need to preload stuff once we have actual content

        Renderer.setCanvas(document.getElementById('canvas'));
        Scheduler.start();

        // TODO: I would prefer to keep this file rather slim. Should there be Game and Level-esque classes to handle most of the setup logic?
        var map = new Map(100, 100, 64);
        Renderer.addRenderable(map);
    }

    if (document.readyState === 'complete')
        onDocumentReady();
    else
        window.addEventListener('load', onDocumentReady, false);
});