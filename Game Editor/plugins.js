define('Plugins', ['./layers/objectLayer', './plugins/objectTypes', './layers/tileLayer'], function (ObjectLayer, ObjectTypes, TileLayer)
{
    'use strict';
    return {
        layerTypes: [ObjectLayer, TileLayer],
        objectTypes: ObjectTypes,
        resources: [
            'heights.png',
            'terrain.png'
        ]
    };
});