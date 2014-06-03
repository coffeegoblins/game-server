define(['renderer/src/renderer', './map', './worldObject', './ladder', 'jsonLoader'], function (Renderer, Map, WorldObject, Ladder, loadJSON)
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

            var soldiers = [];
            var map = new Map(width, height);

            for (layerName in levelData.layers)
            {
                layer = levelData.layers[layerName];
                if (layer.type === 'objectLayer')
                {
                    soldiers.push.apply(soldiers, this.loadObjects(layer, map));
                }
                else if (layerName === 'background')
                {
                    map.spriteSheet = layer.spriteSheet;
                    this.loadTiles(layer, map, 'spriteIndex');
                }
                else if (layerName === 'heights')
                {
                    this.loadTiles(layer, map, 'height');
                }
            }

            Renderer.addRenderableMap(map);
            onComplete(map, soldiers);
        },

        loadObjects: function (layer, map)
        {
            var soldierStartPoints = [];
            for (var i = 0; i < layer.objects.length; i++)
            {
                var object = layer.objects[i];
                switch (object.typeName)
                {
                    case 'ladder':
                        var ladder = new Ladder(object);
                        map.addObject(ladder, object.x, object.y);
                        Renderer.addRenderableLadder(ladder);
                        break;

                    case 'soldier':
                        soldierStartPoints.push(object);
                        break;

                    default:
                        var worldObject = new WorldObject(object);
                        worldObject.type = 'object';
                        map.addObject(worldObject, object.x, object.y);
                        Renderer.addRenderableObject(worldObject);
                        break;
                }
            }

            return soldierStartPoints;
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
