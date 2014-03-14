define('Plugins', [ './plugins/objectTypes'], function (ObjectTypes)
{
    'use strict';
    return {
        isIsometric: true,
        objectTypes: ObjectTypes,
        resources: [
            {fileName: 'heights.png', tileWidth: 64, tileHeight: 64},
            {fileName: 'terrain.png', tileWidth: 64, tileHeight: 32}
        ]
    };
});