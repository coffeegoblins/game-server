require(['Game/src/scheduler', 'renderer', 'Game/src/plotManager', 'Game/src/commandManager', 'jsonLoader'],
function (Scheduler, Renderer, PlotManager, CommandManager, loadJSON)
{
    'use strict';
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