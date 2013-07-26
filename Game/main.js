require(['core/game', 'Render/canvas/renderer'], function (Game, Renderer)
{
    'use strict';
    function onDocumentReady()
    {
        // TODO: We're going to need to preload stuff once we have actual content

        Renderer.setCanvas(document.getElementById('canvas'));
        Game.start();
    }

    if (document.readyState === 'complete')
        onDocumentReady();
    else
        window.addEventListener('load', onDocumentReady, false);
});