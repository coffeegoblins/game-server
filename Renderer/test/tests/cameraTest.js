define(['Game/src/scheduler', 'Renderer/src/camera/camera'], function (Scheduler, Camera)
{
    'use strict';

    function CameraTest()
    {
        this.name = 'Camera Test';
    }

    CameraTest.prototype.scenarioSetup = function ()
    {
        Scheduler.start();
    };

    CameraTest.prototype.scenarioTearDown = function ()
    {
        Scheduler.stop();
    };

    CameraTest.prototype.setup = function ()
    {
        this.camera = new Camera();
    };

    CameraTest.prototype.testMoveToUnitContinuesOnResize = function ()
    {
        var actualUnit = null;

        this.camera.targetUnit = {tileX: 1, tileY: 1};
        this.camera.callbackContext = this;

        this.camera.handleResize(100, 100);

        this.camera.callback = function (targetUnit)
        {
            actualUnit = targetUnit;
        };

        async(function ()
        {
            return actualUnit != null;
        }, '', 1200);
    };

    return CameraTest;
});