define('Plugins', ['./plugins/objectTypes'], function (ObjectTypes)
{
    'use strict';

    return {
        isIsometric: true,
        objectTypes: ObjectTypes,
        resources: [
            {fileName: 'terrain.png', tileWidth: 96, tileHeight: 48},
            {fileName: 'terrain2.png', tileWidth: 96, tileHeight: 48}
        ],
        onLoad: function (data)
        {
            if (!data.player1Positions)
                return;

            // Transform the player positions back into moveable objects
            var objects = data.player1Positions.concat(data.player2Positions);
            for (var i = 0; i < objects.length; i++)
            {
                var position = objects[i];
                position.typeName = 'soldier';
                position.player = (i < data.player1Positions.length) ? 'Player1' : 'Player2';
            }

            data.layers.unitLayer = {index: 0, type: "objectLayer", objects: objects};
            delete data.player1Positions;
            delete data.player2Positions;
        },
        onSave: function (data)
        {
            var layer = data.layers.unitLayer;
            if (layer)
            {
                // Transform the player positions into an easy to consume array
                data.player1Positions = [];
                data.player2Positions = [];

                for (var i = 0; i < layer.objects.length; i++)
                {
                    var object = layer.objects[i];
                    if (object.player === 'Player1')
                        data.player1Positions.push({x: object.x, y: object.y});
                    else
                        data.player2Positions.push({x: object.x, y: object.y});
                }

                delete data.layers.unitLayer;
            }
        }
    };
});