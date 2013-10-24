define([
    './tests/cameraTest',
    './tests/renderableMapTest'
], function (CameraTest, RenderableMapTest)
{
    'use strict';
    return [
        new CameraTest(),
        new RenderableMapTest()
    ];
});