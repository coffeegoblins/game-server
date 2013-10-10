require(
    [
        'TestFramework/testRunner',
        './cameraTest',
        './renderableMapTest'
    ],
    function (TestRunner, CameraTest, RenderableMapTest)
    {
        'use strict';

        TestRunner.runTests([
            new CameraTest(),
            new RenderableMapTest()
        ]);
    });