define(['Editor', 'Core/src/spriteSheet', '../controls/tileSelectionPopup', 'text!../templates/tileLayerPanel.html'], function (Editor, SpriteSheet, TileSelectionPopup, Template)
{
    'use strict';
    var State = {
        None: 0,
        Painting: 1,
        Copying: 2
    };

    function TileLayer()
    {
        this.name = "Tile Layer";
        this.brush = {tiles: [0], width: 1, height: 1};
        this.state = State.None;

        var grid = Editor.getGridSettings();
        this.tileMap = new Editor.TileMap(grid.rect.width, grid.rect.height, grid.tileSize);
        this.spriteSheet = new SpriteSheet({tileWidth: this.tileMap.tileSize, tileHeight: this.tileMap.tileSize});

        this.elements = Utility.getElementFromTemplate(Template);
        this.propertiesSection = new Editor.PropertiesSection();
        this.propertiesSection.setConfig({tileSize: {isRequired: true, minValue: 1}});

        this.properties = {rect: {x: 0, y: 0, width: this.tileMap.width, height: this.tileMap.height}, tileSize: grid.tileSize};
        this.propertiesSection.setObject(this.properties);
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

        var visibleTileSize = tileSize * viewport.scale;
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

                var xPosition = (x * tileSize - viewport.rect.left) * viewport.scale;
                var yPosition = (y * tileSize - viewport.rect.top) * viewport.scale;

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
        return this.elements;
    };

    TileLayer.prototype.initialize = function ()
    {
        var images = Editor.ImageCache.getAll();
        images.sort();

        var contentElement = this.elements[1];
        var select = contentElement.querySelector('[data-name="spriteSheetSelect"]');
        for (var i = 0; i < images.length; i++)
        {
            var option = document.createElement('option');
            option.text = images[i].id;
            select.add(option, null);
        }

        select.addEventListener('change', this.onSpriteSheetSelectChanged.bind(this), false);

        contentElement.insertBefore(this.propertiesSection.element, contentElement.firstChild);
        this.propertiesSection.on('propertyChange', this, this.onPropertyChanged);
        this.elements[0].querySelector('.add-icon').addEventListener('click', this.propertiesSection.addNewProperty.bind(this.propertiesSection), false);
    };

    TileLayer.prototype.onPropertyChanged = function (property, propertyValue)
    {
        if (property.key === 'rect')
        {
            if (propertyValue.key !== 'width' && propertyValue.key !== 'height')
                return;

            var widthValue, heightValue;
            if (propertyValue.key === 'width')
            {
                widthValue = propertyValue.value;
                heightValue = this.tileMap.height;
            }
            else
            {
                widthValue = this.tileMap.width;
                heightValue = propertyValue.value;
            }

            var minWidth = Math.min(this.tileMap.width, widthValue);
            var minHeight = Math.min(this.tileMap.height, heightValue);

            var newMap = new Editor.TileMap(widthValue, heightValue, this.tileMap.tileSize);
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
        else if (property.key === 'tileSize')
        {
            this.tileMap.tileSize = propertyValue.value;
            this.spriteSheet.tileWidth = propertyValue.value;
            this.spriteSheet.tileHeight = propertyValue.value;
        }
    };

    TileLayer.prototype.onSpriteSheetSelectChanged = function (e)
    {
        this.spriteSheetName = e.target.value;
        this.spriteSheet.setImage(Editor.ImageCache.getImage(e.target.value));
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


    TileLayer.prototype.deserialize = function (data)
    {
        this.properties = data.properties;
        this.propertiesSection.setObject(this.properties);

        this.tileMap = new Editor.TileMap(this.properties.rect.width, this.properties.rect.height, this.properties.tileSize);
        for (var i = 0; i < data.tiles.length; i++)
            this.tileMap.setTileAtIndex(i, data.tiles[i]);

        this.spriteSheetName = data.spriteSheet;
        this.elements[1].querySelector('[data-name="spriteSheetSelect"]').value = this.spriteSheetName;
        this.spriteSheet.setImage(Editor.ImageCache.getImage(this.spriteSheetName));
    };

    TileLayer.prototype.serialize = function ()
    {
        var tileData = [];
        for (var i = 0; i < this.tileMap.tiles.length; i++)
            tileData.push(this.tileMap.tiles[i]);

        return {properties: this.properties, spriteSheet: this.spriteSheetName, tiles: tileData};
    };

    return TileLayer;
});
