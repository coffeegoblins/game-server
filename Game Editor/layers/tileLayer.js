define(['Editor', 'Game/src/spriteSheet', '../controls/tileSelectionPopup', 'text!../templates/tileLayerPanel.html'], function (Editor, SpriteSheet, TileSelectionPopup, Template)
{
    'use strict';

    var State = {
        None: 0,
        Painting: 1,
        Copying: 2
    };


    function TileLayer()
    {
        this.name = TileLayer.type;
        this.element = Utility.getElementFromTemplate(Template);
        this.brush = {tiles: [0], width: 1, height: 1};
        this.state = State.None;

        var grid = Editor.getGridSettings();
        this.tileMap = new Editor.TileMap(grid.rect.width, grid.rect.height, grid.tileSize);
        this.spriteSheet = new SpriteSheet({tileWidth: this.tileMap.tileSize, tileHeight: this.tileMap.tileSize});

        this.initialize();
    }

    TileLayer.prototype.draw = function (viewport)
    {
        if (this.spriteSheet.isLoaded())
        {
            this.drawTiles(viewport, this.tileMap.getTile.bind(this.tileMap), 0, 0, this.tileMap.width, this.tileMap.height);

            if (this.isSelected && this.state === State.None && !this.popup)
            {
                viewport.context.globalAlpha = 0.6;
                this.drawTiles(viewport, this.getBrushTile.bind(this.brush), this.brush.x, this.brush.y, this.brush.width, this.brush.height);
                viewport.context.globalAlpha = 1;
            }
        }

        viewport.context.strokeStyle = '#cdcdcd';
        this.drawRectangle(viewport, 0, 0, this.tileMap.width, this.tileMap.height);

        if (this.isSelected && !this.popup)
        {
            viewport.context.strokeStyle = '#d4ca40';
            this.drawRectangle(viewport, this.brush.x, this.brush.y, this.brush.width, this.brush.height);
        }
    };

    TileLayer.prototype.drawRectangle = function (viewport, x, y, width, height)
    {
        var tileSize = this.tileMap.tileSize;
        x = Math.floor((x * tileSize - viewport.rect.left) * viewport.scale);
        y = Math.floor((y * tileSize - viewport.rect.top) * viewport.scale);
        width = Math.floor(width * tileSize * viewport.scale);
        height = Math.floor(height * tileSize * viewport.scale);

        viewport.context.beginPath();
        viewport.context.rect(x, y, width, height);
        viewport.context.stroke();
    };

    TileLayer.prototype.drawTiles = function (viewport, getTile, left, top, width, height)
    {
        var tileSize = this.tileMap.tileSize;
        var visibleTileLeft = Math.max(left, Math.floor(viewport.rect.left / tileSize));
        var visibleTileTop = Math.max(top, Math.floor(viewport.rect.top / tileSize));

        var visibleTileRight = Math.min(left + width - 1, Math.ceil(viewport.rect.right / tileSize));
        var visibleTileBottom = Math.min(top + height - 1, Math.ceil(viewport.rect.bottom / tileSize));

        var visibleTileSize = Math.ceil(tileSize * viewport.scale);
        for (var x = visibleTileLeft; x <= visibleTileRight; x++)
        {
            for (var y = visibleTileTop; y <= visibleTileBottom; y++)
            {
                var tile = getTile(x, y);
                if (!tile)
                    continue;

                var tileRect = this.spriteSheet.getTileBounds(tile - 1);
                if (!tileRect)
                    continue;

                var xPosition = Math.floor((x * tileSize - viewport.rect.left) * viewport.scale);
                var yPosition = Math.floor((y * tileSize - viewport.rect.top) * viewport.scale);

                viewport.context.drawImage(this.spriteSheet.image.data, tileRect.x, tileRect.y, tileRect.width, tileRect.height, xPosition, yPosition, visibleTileSize, visibleTileSize);
            }
        }
    };

    TileLayer.prototype.getBrushTile = function (x, y)
    {
        return this.tiles[x - this.x + (y - this.y) * this.width];
    };

    TileLayer.prototype.getPanel = function ()
    {
        return this.element;
    };

    TileLayer.prototype.initialize = function ()
    {
        this.element.querySelector('[data-name="tileSize"]').value = this.tileMap.tileSize;
        this.element.querySelector('[data-name="width"]').value = this.tileMap.width;
        this.element.querySelector('[data-name="height"]').value = this.tileMap.height;

        var images = Editor.ImageCache.getAll();
        images.sort();

        var select = this.element.querySelector('[data-name="spriteSheetSelect"]');
        for (var i = 0; i < images.length; i++)
        {
            var option = document.createElement('option');
            option.text = images[i].id;
            select.add(option, null);
        }

        select.addEventListener('change', this.onSpriteSheetSelectChanged.bind(this), false);
        this.element.querySelector('[data-name="spriteSheetInput"]').addEventListener('change', this.onSpriteSheetChanged.bind(this), false);
        this.element.querySelector('[data-name="apply"]').addEventListener('click', this.onApplyChanges.bind(this), false);
    };


    TileLayer.prototype.onApplyChanges = function ()
    {
        var tileSizeInput = this.element.querySelector('[data-name="tileSize"]');
        var widthInput = this.element.querySelector('[data-name="width"]');
        var heightInput = this.element.querySelector('[data-name="height"]');

        var tileSize = parseInt(tileSizeInput.value, 10) || this.tileMap.tileSize;
        var width = parseInt(widthInput.value, 10) || this.tileMap.width;
        var height = parseInt(heightInput.value, 10) || this.tileMap.height;

        if (this.tileMap.width !== width || this.tileMap.height !== height)
        {
            var minWidth = Math.min(this.tileMap.width, width);
            var minHeight = Math.min(this.tileMap.height, height);

            var newMap = new TileMap(width, height, tileSize);
            for (var x = 0; x < minWidth; x++)
            {
                for (var y = 0; y < minHeight; y++)
                {
                    var tile = this.tileMap.getTile(x, y);
                    if (tile)
                        newMap.setTile(x, y, tile);
                }
            }

            this.tileMap = newMap;
        }
        else if (tileSize !== this.tileMap.tileSize)
        {
            this.tileMap.tileSize = tileSize;
        }

        tileSizeInput.value = tileSize;
        widthInput.value = width;
        heightInput.value = height;

        this.spriteSheet.tileWidth = this.tileMap.tileSize;
        this.spriteSheet.tileHeight = this.tileMap.tileSize;
    };

    TileLayer.prototype.onSpriteSheetSelectChanged = function (e)
    {
        this.spriteSheet.setImage(Editor.ImageCache.getImage(e.target.value));
    };

    TileLayer.prototype.onSpriteSheetChanged = function (e)
    {
        Editor.FileHandler.loadImage(e.target.files[0], function (file, result)
        {
            this.spriteSheet.setImage(Editor.ImageCache.createImage(result));
        }.bind(this));
    };


    TileLayer.prototype.onMouseDown = function (e, viewport)
    {
        if (e.which === 1)
        {
            if (e.altKey)
            {
                this.state = State.Copying;
                var position = viewport.fromScreen(e.pageX, e.pageY);
                this.selectionRange = {x1: position.x, y1: position.y, x2: position.x, y2: position.y};
            }
            else
            {
                this.state = State.Painting;
            }
        }
    };

    TileLayer.prototype.onMouseMove = function (e, viewport)
    {
        var position = viewport.fromScreen(e.pageX, e.pageY);
        if (this.state === State.Copying)
        {
            this.selectionRange.x2 = position.x;
            this.selectionRange.y2 = position.y;
            this.setBrush();
        }
        else
        {
            this.setBrushPosition(position);
            if (this.state === State.Painting)
                this.setTile();
        }
    };

    TileLayer.prototype.onMouseUp = function (e, viewport)
    {
        if (e.which === 1)
        {
            if (this.state === State.Copying)
            {
                this.setBrush();
                this.selectionRange = null;
            }
            else if (this.state === State.Painting)
            {
                this.setBrushPosition(viewport.fromScreen(e.pageX, e.pageY));
                this.setTile();
            }

            this.state = State.None;
        }
    };

    TileLayer.prototype.onClick = function (e)
    {
        if (e.which === 3 && this.spriteSheet.isLoaded())
        {
            this.popup = new TileSelectionPopup(this.spriteSheet).show(e.pageX, e.pageY);
            this.popup.on('selectionFinished', this, function (brush) { this.brush = brush; });
            this.popup.on('close', this, function () { this.popup = null; });
        }
    };


    TileLayer.prototype.setBrushPosition = function (position)
    {
        this.brush.x = Math.floor(0.5 + position.x / this.tileMap.tileSize - this.brush.width / 2);
        this.brush.y = Math.floor(0.5 + position.y / this.tileMap.tileSize - this.brush.height / 2);
    };

    TileLayer.prototype.setBrush = function ()
    {
        var rect = Rectangle.fromPoints(this.selectionRange.x1, this.selectionRange.y1, this.selectionRange.x2, this.selectionRange.y2);

        var tileSize = this.tileMap.tileSize;
        var right = Math.ceil(rect.right / tileSize);
        var bottom = Math.ceil(rect.bottom / tileSize);

        this.brush.x = Math.floor(rect.left / tileSize);
        this.brush.y = Math.floor(rect.top / tileSize);
        this.brush.width = right - this.brush.x;
        this.brush.height = bottom - this.brush.y;

        this.brush.tiles.length = 0;
        for (var y = this.brush.y; y < bottom; y++)
        {
            for (var x = this.brush.x; x < right; x++)
            {
                var tile = 0;
                if (this.tileMap.isInBounds(x, y))
                    tile = this.tileMap.getTile(x, y);

                this.brush.tiles.push(tile);
            }
        }
    };

    TileLayer.prototype.setTile = function ()
    {
        for (var x = 0; x < this.brush.width; x++)
        {
            for (var y = 0; y < this.brush.height; y++)
            {
                var tileX = this.brush.x + x;
                var tileY = this.brush.y + y;

                if (this.tileMap.isInBounds(tileX, tileY))
                {
                    var tile = this.brush.tiles[x + y * this.brush.width];
                    this.tileMap.setTile(tileX, tileY, tile);
                }
            }
        }
    };


    TileLayer.prototype.serialize = function ()
    {
        var tileData = [];
        for (var i = 0; i < this.tileMap.tiles.length; i++)
            tileData.push(this.tileMap.tiles[i]);

        return {
            height: this.tileMap.height,
            width: this.tileMap.width,
            tileSize: this.tileMap.tileSize,
            tiles: tileData
        };
    };

    TileLayer.prototype.deserialize = function (data)
    {
        this.tileMap = new TileMap(data.width, data.height, data.tileSize);
        for (var i = 0; i < data.tiles.length; i++)
            this.tileMap.setTileAtIndex(i, data.tiles[i]);

        this.element.querySelector('[data-name="tileSize"]').value = this.tileMap.tileSize;
        this.element.querySelector('[data-name="width"]').value = this.tileMap.width;
        this.element.querySelector('[data-name="height"]').value = this.tileMap.height;
    };


    TileLayer.type = 'Tile Layer';
    return TileLayer;
});