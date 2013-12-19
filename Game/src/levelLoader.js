define(['renderer', 'Game/src/map', 'Game/src/soldier', 'Game/src/worldObject', 'Game/src/ladder',
        'Game/src/turnManager', 'Renderer/src/ui/renderableTurnQueue', 'jsonLoader'],
function (Renderer, Map, Soldier, WorldObject, Ladder, TurnManager, RenderableTurnQueue, loadJSON)
    {
        'use strict';

        function LevelLoader() { }

    LevelLoader.prototype.loadLevel = function (fileName, weaponData, onComplete)
        {
            var self = this;
        this.weaponData = weaponData;

        loadJSON(fileName, function (levelData)
            {
                self.onLevelLoaded(levelData, onComplete);
            });
        };

        LevelLoader.prototype.onLevelLoaded = function (levelData, onComplete)
        {
            this.map = new Map();
            this.map.load(levelData);
            Renderer.addRenderableMap(this.map);

            for (var i = 0; i < levelData.objects.length; i++)
            {
                var object = levelData.objects[i];
                switch (object.objectType)
                {
                    case 'ladder':
                        var ladder = new Ladder(object.properties);
                        this.map.addObject(ladder, object.x, object.y);
                        Renderer.addRenderableLadder(ladder);
                        break;

                    case 'object':
                        var worldObject = new WorldObject(object.properties);
                        this.map.addObject(worldObject, object.x, object.y);
                        Renderer.addRenderableObject(worldObject);
                        break;

                    case 'soldier':
                        var soldier = new Soldier(object.properties);

                        // Convert weapon from just a name to an object
                        var weaponName = soldier.weapon;

                        soldier.weapon = this.weaponData[soldier.weapon];
                        soldier.weapon.Name = weaponName;

                        this.map.addUnit(soldier, object.x, object.y);
                        TurnManager.addUnit(soldier);
                        RenderableTurnQueue.addUnit(soldier);
                        Renderer.addRenderableSoldier(soldier);
                        break;
                }
            }

            TurnManager.on("beginTurn", RenderableTurnQueue, RenderableTurnQueue.onBeginTurn);
            TurnManager.on("endTurn", RenderableTurnQueue, RenderableTurnQueue.onEndTurn);

            // TODO Determine local player properly
            this.player = TurnManager.unitList[0].player;

            if (onComplete)
                onComplete(this.map, this.player);
        };

        return new LevelLoader();
    });