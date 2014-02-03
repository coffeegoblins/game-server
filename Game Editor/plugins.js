define('Plugins', ['./layers/objectLayer', './plugins/objectTypes', './layers/tileLayer'], function (ObjectLayer, ObjectTypes, TileLayer)
{
    'use strict';
    return {
        layerTypes: {
            'objectLayer': ObjectLayer,
            'tileLayer': TileLayer
        },
        objectTypes: ObjectTypes,
        resources: [
            'heights.png',
            'terrain.png',
            'walls.png'
        ]
    };
});