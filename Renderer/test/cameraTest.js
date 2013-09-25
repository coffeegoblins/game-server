require(['camera/camera'], function (Camera)
{
    'use strict';

    var CameraTest = new TestCase('CameraTest');

    CameraTest.prototype.setUp = function ()
    {
        this.camera = new Camera();
    };

    CameraTest.prototype.testCamera = function ()
    {
        // TODO Tests aren't being found
    };
});