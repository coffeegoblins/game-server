require(['Game/src/scheduler', 'Renderer/canvas/renderer', 'Game/src/maps/map'], function (Scheduler, Renderer, Map)
{
    'use strict';
    function onDocumentReady()
    {
        // TODO: We're going to need to preload stuff once we have actual content

        Renderer.setCanvas(document.getElementById('canvas'));
        Scheduler.start();

        // TODO: I would prefer to keep this file rather slim. Should there be Game and Level-esque classes to handle most of the setup logic?
        var map = new Map(100, 100, 64);

        // Build a hill for illustration purposes
        var height = 5;
        var summitX = 10;
        var summitY = 5;

        for (var x = summitX - height; x <= summitX + height; x++)
        {
            for (var y = summitY - height; y <= summitY + height; y++)
            {
                var tile = map.getTile(x, y);
                if (tile)
                {
                    var xDelta = Math.abs(summitX - x);
                    var yDelta = Math.abs(summitY - y);
                    tile.height = height - Math.max(xDelta, yDelta);
                }
            }
        }

        Renderer.addRenderableMap(map);
    }

    if (document.readyState === 'complete')
        onDocumentReady();
    else
        window.addEventListener('load', onDocumentReady, false);
});