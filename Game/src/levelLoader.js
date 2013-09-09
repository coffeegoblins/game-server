define(['renderer', 'Game/src/map', 'Game/src/soldier', 'Renderer/src/ui/sampleView', 'Game/src/worldObject',
        'Game/src/turnManager'],
    function (Renderer, Map, Soldier, SampleUI, WorldObject, TurnManager)
    {
        'use strict';

        /**
         * @constructor
         */
        function LevelLoader()
        {
        }

        /**
         * @param fileName The name of the file to load
         */
        LevelLoader.prototype.loadLevel = function (fileName)
        {
            // TODO: Asynchronous loading from file
            this.map = new Map(100, 100);

            // Build a hill for illustration purposes
            var height = 5;
            var summitX = 10;
            var summitY = 5;

            var x, y, tile;
            for (x = summitX - height; x <= summitX + height; x++)
            {
                for (y = summitY - height; y <= summitY + height; y++)
                {
                    tile = this.map.getTile(x, y);
                    if (tile)
                    {
                        var xDelta = Math.abs(summitX - x);
                        var yDelta = Math.abs(summitY - y);
                        tile.height = height - Math.max(xDelta, yDelta);
                    }
                }
            }

            Renderer.addRenderableMap(this.map);

            var soldier = new Soldier();
            soldier.name = "A";
            var soldier2 = new Soldier();
            soldier2.name = "B";
            var soldier3 = new Soldier();
            soldier3.name = "C";

            this.map.addUnit(soldier, 0, 0);
            this.map.addUnit(soldier2, 1, 1);
            this.map.addUnit(soldier3, 2, 2);

            Renderer.addRenderableSoldier(soldier, "Renderer/content/awesome.png", "Renderer/content/awesome.png");
            Renderer.addRenderableSoldier(soldier2, "Renderer/content/awesome_sad.png", "Renderer/content/awesome_sad.png");
            Renderer.addRenderableSoldier(soldier3, "Renderer/content/awesome.png", "Renderer/content/awesome.png");

            TurnManager.activeUnitView.show(TurnManager.unitList[0], 0, this, null);

            // Add objects
            var worldObject = new WorldObject(2, 2);
            this.map.addObject(worldObject, 4, 4);
            Renderer.addRenderableObject(worldObject);

            for (var i = 0; i < 100; i++)
            {
                worldObject = new WorldObject();
                do
                {
                    x = Math.floor(Math.random() * this.map.width);
                    y = Math.floor(Math.random() * this.map.height);

                    tile = this.map.getTile(x, y);
                    tile.height = Infinity;
                }
                while (tile.content != null || tile.unit != null);

                this.map.addObject(worldObject, x, y);
                Renderer.addRenderableObject(worldObject);
            }

            TurnManager.beginTurn();
        };

        return new LevelLoader();
    });