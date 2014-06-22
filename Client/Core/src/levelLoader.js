define(['./map', './worldObject', './ladder', 'jsonLoader'], function (Map, WorldObject, Ladder, loadJSON)
{
    'use strict';

    return {
        loadLevel: function (fileName, onComplete)
        {
            var self = this;
            loadJSON(fileName, function (levelData)
            {
                self.onLevelLoaded(levelData, onComplete);
            });
        },

        onLevelLoaded: function (levelData, onComplete)
        {
            var width = 0;
            var height = 0;

            var layer;
            for (var layerName in levelData.layers)
            {
                layer = levelData.layers[layerName];
                if (layer.type === 'tileLayer')
                {
                    var rect = layer.properties.rect;
                    width = Math.max(width, rect.x + rect.width);
                    height = Math.max(height, rect.y + rect.height);
                }
            }

            var data = {
                map: new Map(width, height),
                objects: [],
                player1Positions: [],
                player2Positions: []
            };

            for (layerName in levelData.layers)
            {
                layer = levelData.layers[layerName];
                if (layer.type === 'objectLayer')
                {
                    this.loadObjects(layer, data);
                }
                else if (layerName === 'background')
                {
                    data.map.spriteSheet = layer.spriteSheet;
                    this.loadTiles(layer, data.map, 'spriteIndex');
                }
                else if (layerName === 'heights')
                {
                    this.loadTiles(layer, data.map, 'height');
                }
            }

            onComplete(data);
        },

        loadObjects: function (layer, data)
        {
            for (var i = 0; i < layer.objects.length; i++)
            {
                var object = layer.objects[i];
                if (object.typeName === 'soldier')
                {
                    if (object.player === 'Player1')
                        data.player1Positions.push(object);
                    else
                        data.player2Positions.push(object);

                }
                else
                {
                    data.objects.push(new WorldObject(object));
                }
            }
        },

        loadTiles: function (layer, map, property)
        {
            for (var i = 0; i < layer.tiles.length; i++)
            {
                var rect = layer.properties.rect;
                var x = rect.x + (i % rect.width);
                var y = rect.y + Math.floor(i / rect.width);

                var tile = map.getTile(x, y);
                if (tile)
                {
                    tile[property] = layer.tiles[i];
                }
            }
        }
    };
});
