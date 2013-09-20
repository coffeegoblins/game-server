define(['renderer', 'Game/src/turnManager', 'Game/src/pathManager', 'Renderer/src/ui/actionBarView', 'Renderer/src/ui/activeUnitView'],
function (Renderer, TurnManager, PathManager, ActionBarView, ActiveUnitView)
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

        this.activeUnitView = new ActiveUnitView();

        TurnManager.registerBeginTurnEvent("activeUnitView", this.activeUnitView.onBeginTurn.bind(this.activeUnitView), this.activeUnitView);
        TurnManager.registerEndTurnEvent("activeUnitView", this.activeUnitView.onEndTurn.bind(this.activeUnitView), this.activeUnitView);
    }

    function onBeginTurn(activeUnit)
    {
        Renderer.addRenderablePath("availableTiles", PathManager.calculateAvailableTiles(this, activeUnit), 0, 255, 0, 0.4);
        Renderer.blinkUnit(activeUnit, 1.5);
        ActionBarView.showActions();
        ActionBarView.addActions([
            {id: "EndTurn", method: this.onEndTurnAction, context: this}
        ]);
    }

    function onEndTurn(activeUnit)
    {
        Renderer.stopBlinkUnit(activeUnit);

        // TODO Hide content and attack action
        ActionBarView.removeActions('Move');

        Renderer.clearRenderablePathById("availableTiles");
        Renderer.clearRenderablePathById("selectedPath");

        ActionBarView.hideActions();
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

    Map.prototype.canMoveToTile = function (unit, tileX, tileY)
    {
        var tile = this.getTile(tileX, tileY);
        if (!tile || tile.unit)
            return false;

        if (tile.content)
        {
            if (!tile.content.isClimbable || !unit.canClimbObjects)
                return false;
        }

        return true;
    };

    Map.prototype.onClick = function (e, x, y, scale)
    {
        var tileX = Math.floor(x / scale);
        var tileY = Math.floor(y / scale);

        var tile = this.getTile(tileX, tileY);
        if (tile)
        {
            this.activeUnitView.previewAP(0);
            Renderer.clearRenderablePathById("selectedPath");

            // TODO Hide content and attack action
            ActionBarView.removeActions('Move');

            this.selectedTileX = tileX;
            this.selectedTileY = tileY;

            if (tile.content)
            {
                if (!tile.content.isClimbable || !TurnManager.activeUnit.canClimbObjects)
                {
                    // TODO Content logic, Show action
                    return;
                }
            }

            if (tile.unit)
            {
                // TODO Attack logic, Show action
                return;
            }

            var path = PathManager.calculatePath(this, TurnManager.activeUnit, tileX, tileY);
            if (path)
            {
                this.selectedTileCost = path[path.length - 1].distance;
                this.activeUnitView.previewAP(this.selectedTileCost);

                Renderer.addRenderablePath("selectedPath", path, 255, 165, 0, 1, 1.5);
                ActionBarView.addActions([
                    {id: "Move", method: this.onMoveAction, context: this}
                ]);
            }
        }
    };

    Map.prototype.onMoveAction = function ()
    {
        this.moveActiveUnit(this.selectedTileX, this.selectedTileY);

        TurnManager.activeUnit.ap -= this.selectedTileCost;

        this.activeUnitView.setAP(TurnManager.activeUnit.ap);

        Renderer.clearRenderablePathById("availableTiles");
        Renderer.clearRenderablePathById("selectedPath");

        Renderer.camera.moveToUnit(TurnManager.activeUnit, 1);

        // TODO Hide content and attack action
        ActionBarView.removeActions('Move');

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
        var unit = TurnManager.activeUnit;
        if (this.canMoveToTile(unit, x, y))
        {
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