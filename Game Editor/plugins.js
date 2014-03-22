define('Plugins', [ './plugins/objectTypes'], function (ObjectTypes)
{
    'use strict';
    return {
        isIsometric: true,
        objectTypes: ObjectTypes,
        resources: [
            {fileName: 'terrain.png', tileWidth: 96, tileHeight: 48}
        ]
    };
});