define(['renderer', 'Game/src/map', 'Game/src/soldier', 'Game/src/worldObject', 'Game/src/ladder', 'Game/src/turnManager', 'Renderer/src/ui/renderableTurnQueue'],
    function (Renderer, Map, Soldier, WorldObject, Ladder, TurnManager, RenderableTurnQueue)
    {
        'use strict';

        function LevelLoader() { }

        LevelLoader.prototype.loadLevel = function (fileName, onComplete)
        {
            var request = new XMLHttpRequest();
            request.overrideMimeType('application/json');
            request.open('GET', 'Game/content/' + fileName + '.json');

            var self = this;
            request.onreadystatechange = function ()
            {
                if (request.readyState === 4 && request.status === 200)
                    self.onLevelLoaded(JSON.parse(request.responseText), onComplete);
            };

            request.send();
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
                        this.map.addUnit(soldier, object.x, object.y);
                        TurnManager.unitList.push(soldier);
                        RenderableTurnQueue.addUnit(soldier);
                        Renderer.addRenderableSoldier(soldier, object.unitImage, object.previewImage);
                        break;
                }
            }

            TurnManager.registerBeginTurnEvent("RenderableTurnQueueBeginTurn", RenderableTurnQueue.onBeginTurn, RenderableTurnQueue);
            TurnManager.registerEndTurnEvent("RenderableTurnQueueEndTurn", RenderableTurnQueue.onEndTurn, RenderableTurnQueue);

            if (onComplete)
                onComplete(this.map);
        };

        return new LevelLoader();
    });