define(['renderer', 'Game/src/map', 'Game/src/soldier', 'Game/src/worldObject', 'Game/src/ladder', 'Game/src/turnManager', 'Renderer/src/ui/renderableTurnQueue', 'jsonLoader'],
    function (Renderer, Map, Soldier, WorldObject, Ladder, TurnManager, RenderableTurnQueue, loadJSON)
    {
        'use strict';

        return {
            loadLevel: function (fileName, weaponData, onComplete)
            {
                var self = this;
                this.weaponData = weaponData;

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

                this.map = new Map(width, height);
                for (i = 0; i < levelData.layers.length; i++)
                {
                    layer = levelData.layers[i];
                    if (layer.type === 'objectLayer')
                    {
                        this.loadObjects(layer);
                    }
                    else
                    {
                        switch (layer.name)
                        {
                            case 'Foreground':
                                this.map.foregroundSpriteSheet = layer.spriteSheet;
                                this.loadTiles(layer, 'foregroundTile');
                                break;
                            case 'Background':
                                this.map.backgroundSpriteSheet = layer.spriteSheet;
                                this.loadTiles(layer, 'backgroundTile');
                                break;
                            case 'Heights':
                                this.loadTiles(layer, 'height');
                                break;
                        }
                    }
                }

                Renderer.addRenderableMap(this.map);
                TurnManager.on("beginTurn", RenderableTurnQueue, RenderableTurnQueue.onBeginTurn);
                TurnManager.on("endTurn", RenderableTurnQueue, RenderableTurnQueue.onEndTurn);

                // TODO Determine local player properly
                this.player = TurnManager.unitList[0].player;

                if (onComplete)
                {
                    onComplete(this.map, this.player);
                }
            },

            loadObjects: function (layer)
            {
                for (var i = 0; i < layer.objects.length; i++)
                {
                    var object = layer.objects[i];
                    switch (object.typeName)
                    {
                        case 'ladder':
                            var ladder = new Ladder(object);
                            this.map.addObject(ladder, object.x, object.y);
                            Renderer.addRenderableLadder(ladder);
                            break;

                        case 'object':
                            var worldObject = new WorldObject(object);
                            this.map.addObject(worldObject, object.x, object.y);
                            Renderer.addRenderableObject(worldObject);
                            break;

                        case 'soldier':
                            var soldier = new Soldier(object);

                            // Convert weapon from just a name to an object
                            var weaponName = soldier.weapon;
                            soldier.weapon = this.weaponData[soldier.weapon];
                            soldier.weapon.name = weaponName;

                            this.map.addUnit(soldier, object.x, object.y);
                            TurnManager.addUnit(soldier);
                            RenderableTurnQueue.addUnit(soldier);
                            Renderer.addRenderableSoldier(soldier);
                            break;
                    }
                }
            },

            loadTiles: function (layer, property)
            {
                for (var i = 0; i < layer.tiles.length; i++)
                {
                    var rect = layer.properties.rect;
                    var x = rect.x + (i % rect.width);
                    var y = rect.y + Math.floor(i / rect.width);

                    var tile = this.map.getTile(x, y);
                    if (tile)
                    {
                        tile[property] = layer.tiles[i];
                    }
                }
            }
        };
    });