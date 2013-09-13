define(['renderer', 'Game/src/turnManager', 'Game/src/pathManager', 'Renderer/src/ui/actionBarView'],
    function (Renderer, TurnManager, PathManager, ActionBarView)
    {
        'use strict';

        /**
         * @param width The number of tiles on the horizontal axis of the renderableMap
         * @param height The number of tiles on the vertical axis of the renderableMap
         * @param initialHeight The height all tiles are initialized to. Default is 0.
         * @constructor
         */
        function Map(width, height, initialHeight)
        {
            this.width = width;
            this.height = height;

            if (initialHeight == null)
                initialHeight = 0;

            this.tiles = [];
            for (var y = 0; y < height; y++)
            {
                for (var x = 0; x < width; x++)
                    this.tiles.push({height: initialHeight});
            }

            TurnManager.registerBeginTurnEvent("onBeginTurn", onBeginTurn, this);
            TurnManager.registerEndTurnEvent("onEndTurn", onEndTurn, this);
        }

        function onBeginTurn(activeUnit)
        {
            Renderer.camera.moveToUnit(activeUnit, 1);
            Renderer.addRenderablePath("availableTiles", PathManager.calculateAvailableTiles(this, activeUnit), 0, 255, 0, 0.4);
        }

        function onEndTurn(activeUnit)
        {
            Renderer.clearRenderablePathById("availableTiles");
            Renderer.clearRenderablePathById("selectedPath");

            ActionBarView.hideActions();
            TurnManager.beginTurn();
        }

        /**
         * @param object The object to add
         * @param x The X position of target tile
         * @param y The Y position of target tile
         */
        Map.prototype.addObject = function (object, x, y)
        {
            object.tileX = x;
            object.tileY = y;

            for (var tileX = x; tileX < x + object.sizeX; tileX++)
            {
                for (var tileY = y; tileY < y + object.sizeY; tileY++)
                {
                    var tile = this.getTile(tileX, tileY);
                    if (tile)
                    {
                        tile.content = object;
                    }
                }
            }
        };

        /**
         * @param unit The unit to add
         * @param x The X position of target tile
         * @param y The Y position of target tile
         */
        Map.prototype.addUnit = function (unit, x, y)
        {
            var tile = this.getTile(x, y);

            unit.tileX = x;
            unit.tileY = y;

            tile.unit = unit;

            TurnManager.unitList.push(unit);
        };

        Map.prototype.onClick = function (e, x, y, scale)
        {
            Renderer.clearRenderablePathById("selectedPath");

            var tileX = Math.floor(x / scale);
            var tileY = Math.floor(y / scale);

            var tile = this.getTile(tileX, tileY);
            if (tile)
            {
                ActionBarView.hideActions();

                this.selectedTileX = tileX;
                this.selectedTileY = tileY;

                if (tile.content && (!tile.content.isClimbable || !TurnManager.activeUnit.canClimbObjects))
                {
                    // TODO Content Logic
                    return;
                }

                if (tile.unit)
                {
                    // TODO Attack Logic
                    return;
                }

                Renderer.addRenderablePath("selectedPath", PathManager.calculatePath(this, TurnManager.activeUnit, tileX, tileY), 255, 165, 0, 1, 1.5);
                ActionBarView.showActions([
                    {id: "Move", method: this.onMoveAction, context: this},
                    {id: "EndTurn", method: this.onEndTurnAction, context: this}
                ]);
            }
        };

        Map.prototype.onMoveAction = function ()
        {
            this.moveActiveUnit(this.selectedTileX, this.selectedTileY);

            Renderer.clearRenderablePathById("availableTiles");
            Renderer.clearRenderablePathById("selectedPath");

            ActionBarView.hideActions();
            Renderer.camera.moveToUnit(TurnManager.activeUnit, 1);

            Renderer.addRenderablePath("availableTiles", PathManager.calculateAvailableTiles(this, TurnManager.activeUnit), 0, 255, 0, 0.4);
        };

        Map.prototype.onEndTurnAction = function ()
        {
            TurnManager.endTurn();
        };

        /**
         * @param x The x coordinate of the target tile in the tile array
         * @param y The y coordinate of the target tile in the tile array
         */
        Map.prototype.moveActiveUnit = function (x, y)
        {
            var tile = this.getTile(x, y);
            if (tile && !tile.unit && !tile.content)
            {
                var unit = TurnManager.unitList[0];
                var previousTile = this.getTile(unit.tileX, unit.tileY);
                if (previousTile && previousTile.unit === unit)
                    previousTile.unit = null;

                unit.tileX = x;
                unit.tileY = y;

                tile.unit = unit;
            }
        };

        /**
         * @param x The x coordinate of the tile in the tile array
         * @param y The y coordinate of the tile in the tile array
         */
        Map.prototype.getTile = function (x, y)
        {
            if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
                return null;

            return this.tiles[x + y * this.width];
        };

        /**
         * @param object The object to remove
         */
        Map.prototype.removeObject = function (object)
        {
            for (var tileX = object.tileX; tileX < object.tileX + object.sizeX; tileX++)
            {
                for (var tileY = object.tileY; tileY < object.tileY + object.sizeY; tileY++)
                {
                    var tile = this.getTile(tileX, tileY);
                    if (tile && tile.content === object)
                        tile.content = null;
                }
            }
        };

        Map.prototype.maxHeight = 16;

        return Map;
    });