require(['camera/camera'], function (Camera)
{
    'use strict';

    var CameraTest = new TestCase('CameraTest');

    CameraTest.prototype.setUp = function ()
    {
        this.camera = new Camera();
    };

    CameraTest.prototype.testMoveViewport = function ()
    {
        this.camera.moveViewport(10, 0, 1);

        this.camera.update(null, 0.1);

        assertEquals(1, this.camera.viewportRect.x);
        assertEquals(0, this.camera.viewportRect.y);

        this.camera.update(null, 0.1);

        assertEquals(2, this.camera.viewportRect.x);
        assertEquals(0, this.camera.viewportRect.y);
    };

    CameraTest.prototype.testTimeLessThanUpdate = function ()
    {
        this.camera.moveViewport(10, 10, 1);

        this.camera.update(null, 50);

        assertEquals(10, this.camera.viewportRect.x);
        assertEquals(10, this.camera.viewportRect.y);
    };
});