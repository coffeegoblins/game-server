define(['renderer', 'Game/src/map', 'Game/src/soldier', 'Game/src/worldObject', 'Game/src/ladder', 'Game/src/turnManager'],
    function (Renderer, Map, Soldier, WorldObject, Ladder, TurnManager)
    {
        'use strict';

        function LevelLoader() { }

        /**
         * @param fileName The name of the file to load
         */
        LevelLoader.prototype.loadLevel = function (fileName)
        {
            // TODO: Asynchronous loading from file, update gui appropriately
            this.map = new Map(100, 100, 4);

            // Build a hill
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
                        tile.height += height - Math.max(xDelta, yDelta);
                    }
                }
            }

            // Build a pit
            for (x = 1; x <= 3; x++)
            {
                for (y = 8; y <= 10; y++)
                {
                    tile = this.map.getTile(x, y);
                    if (tile)
                        tile.height = 0;
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
            TurnManager.unitList.push(soldier);

            this.map.addUnit(soldier2, 1, 1);
            TurnManager.unitList.push(soldier2);

            this.map.addUnit(soldier3, 2, 2);
            TurnManager.unitList.push(soldier3);

            Renderer.addRenderableSoldier(soldier, "Renderer/content/awesome.png", "Renderer/content/awesome.png");
            Renderer.addRenderableSoldier(soldier2, "Renderer/content/awesomeSad.png", "Renderer/content/awesomeSad.png");
            Renderer.addRenderableSoldier(soldier3, "Renderer/content/awesome.png", "Renderer/content/awesome.png");

            // Add objects
            var worldObject = new WorldObject(2, 2);
            this.map.addObject(worldObject, 4, 4);
            Renderer.addRenderableObject(worldObject);

            var ladder = new Ladder('up');
            this.map.addObject(ladder, 2, 8);
            Renderer.addRenderableLadder(ladder);

            ladder = new Ladder('down');
            this.map.addObject(ladder, 2, 10);
            Renderer.addRenderableLadder(ladder);

            ladder = new Ladder('left');
            this.map.addObject(ladder, 1, 9);
            Renderer.addRenderableLadder(ladder);

            ladder = new Ladder('right');
            this.map.addObject(ladder, 3, 9);
            Renderer.addRenderableLadder(ladder);

            for (var i = 0; i < 100; i++)
            {
                worldObject = new WorldObject();
                do
                {
                    x = Math.floor(Math.random() * this.map.width);
                    y = Math.floor(Math.random() * this.map.height);

                    tile = this.map.getTile(x, y);
                }
                while (tile.content != null || tile.unit != null);

                this.map.addObject(worldObject, x, y);
                Renderer.addRenderableObject(worldObject);
            }

            return this.map;
        };

        return new LevelLoader();
    });