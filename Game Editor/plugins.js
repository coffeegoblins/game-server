define('Plugins', ['./layers/objectLayer', './layers/tileLayer'], function (ObjectLayer, TileLayer)
{
    'use strict';
    return {
        layers: [ObjectLayer, TileLayer],
        plugins: [],
        resources: [
            'terrain.png'
        ]
    };
});