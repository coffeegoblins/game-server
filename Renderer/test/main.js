require(
    [
        'TestFramework/testRunner',
        './cameraTest',
        './renderableMapTest',
        './transitionEffectTest'
    ],
    function (TestRunner, CameraTest, RenderableMapTest, TransitionEffectTest)
    {
        'use strict';

        TestRunner.runTests([
            new CameraTest(),
            new RenderableMapTest(),
            new TransitionEffectTest()
        ]);
    });