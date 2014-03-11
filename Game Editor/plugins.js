define('Plugins', [ './plugins/objectTypes'], function (ObjectTypes)
{
    'use strict';
    return {
        isIsometric: true,
        objectTypes: ObjectTypes,
        resources: [
            'heights.png',
            'terrain.png',
            'walls.png'
        ]
    };
});