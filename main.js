require(['Game/src/scheduler', 'renderer', 'Game/src/plotManager', 'Game/src/commandManager', 'jsonLoader'],
function (Scheduler, Renderer, PlotManager, CommandManager, loadJSON)
{
    'use strict';

    // Wait for device API libraries to load
    document.addEventListener("deviceready", onDeviceReady, false);

    // device APIs are available
    function onDeviceReady()
    {
        console.log("OnDeviceReady");
    }

    function onDocumentReady()
    {
        console.log("OnDocumentReady");

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