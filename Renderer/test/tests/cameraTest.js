define(['Renderer/src/camera/camera'], function (Camera)
{
    'use strict';

    function CameraTest()
    {
        this.name = 'Camera Test';
    }

    CameraTest.prototype.setup = function ()
    {
        this.camera = new Camera();
    };

    CameraTest.prototype.testCamera = function ()
    {
        assertFail('TODO: Actually write some tests');
    };

    return CameraTest;
});