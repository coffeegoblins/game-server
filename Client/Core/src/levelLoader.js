define(['renderer', './map', './worldObject', './ladder', 'jsonLoader'], function (Renderer, Map, WorldObject, Ladder, loadJSON)
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
            for (var i = 0; i < levelData.layers.length; i++)
            {
                layer = levelData.layers[i];
                if (layer.type === 'tileLayer')
                {
                    var rect = layer.properties.rect;
                    width = Math.max(width, rect.x + rect.width);
                    height = Math.max(height, rect.y + rect.height);
                }
            }

            var soldiers = [];
            var map = new Map(width, height);

            for (i = 0; i < levelData.layers.length; i++)
            {
                layer = levelData.layers[i];
                if (layer.type === 'objectLayer')
                {
                    soldiers.push.apply(soldiers, this.loadObjects(layer, map));
                }
                else
                {
                    switch (layer.name)
                    {
                        case 'Foreground':
                            map.foregroundSpriteSheet = layer.spriteSheet;
                            this.loadTiles(layer, map, 'foregroundTile');
                            break;
                        case 'Background':
                            map.backgroundSpriteSheet = layer.spriteSheet;
                            this.loadTiles(layer, map, 'backgroundTile');
                            break;
                        case 'Heights':
                            this.loadTiles(layer, map, 'height');
                            break;
                    }
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

                    case 'object':
                        var worldObject = new WorldObject(object);
                        map.addObject(worldObject, object.x, object.y);
                        Renderer.addRenderableObject(worldObject);
                        break;

                    case 'soldier':
                        soldierStartPoints.push(object);
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
