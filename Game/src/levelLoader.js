define(['Renderer/canvas/renderer', 'Game/src/map', 'Game/src/soldier'], function (Renderer, Map, Soldier)
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
        var map = new Map(100, 100, 64);

        // Build a hill for illustration purposes
        var height = 5;
        var summitX = 10;
        var summitY = 5;

        for (var x = summitX - height; x <= summitX + height; x++)
        {
            for (var y = summitY - height; y <= summitY + height; y++)
            {
                var tile = map.getTile(x, y);
                if (tile)
                {
                    var xDelta = Math.abs(summitX - x);
                    var yDelta = Math.abs(summitY - y);
                    tile.height = height - Math.max(xDelta, yDelta);
                }
            }
        }

        Renderer.addRenderableMap(map);

        var soldier = new Soldier();
        var soldier2 = new Soldier();
        var soldier3 = new Soldier();

        map.addUnit(soldier, 0, 0);
        map.addUnit(soldier2, 1, 1);
        map.addUnit(soldier3, 2, 2);

        Renderer.addRenderableSoldier(soldier);
        Renderer.addRenderableSoldier(soldier2);
        Renderer.addRenderableSoldier(soldier3);
    };

    return new LevelLoader;
});