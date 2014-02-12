define(['Core/src/eventManager'], function (Events)
{
    'use strict';

    var activePopup;

    function TileSelectionPopup(spriteSheet)
    {
        this.brush = {};
        this.spriteSheet = spriteSheet;
    }

    TileSelectionPopup.prototype.close = function ()
    {
        document.body.removeChild(this.element);
        activePopup = null;
        this.trigger('close');
    };

    TileSelectionPopup.prototype.onMouseAction = function (e)
    {
        if (e.which === 1)
        {
            var xPosition = e.pageX - this.left + this.element.scrollLeft;
            var yPosition = e.pageY - this.top + this.element.scrollTop;

            switch (e.type)
            {
                case 'mousedown':
                    this.selectionRange = {x1: xPosition, y1: yPosition, x2: xPosition, y2: yPosition};
                    this.setSelectionMarker();
                    break;

                case 'mousemove':
                    this.selectionRange.x2 = xPosition;
                    this.selectionRange.y2 = yPosition;
                    this.setSelectionMarker();
                    break;

                case 'mouseup':
                    this.brush.tiles = [];
                    for (var y = 0; y < this.brush.height; y++)
                    {
                        for (var x = 0; x < this.brush.width; x++)
                        {
                            var tileX = x + this.brush.x;
                            var tileY = y + this.brush.y;
                            var tile = this.spriteSheet.getTile(tileX, tileY) + 1;
                            this.brush.tiles.push(tile);
                        }
                    }

                    this.trigger('selectionFinished', this.brush);
                    this.close();
                    break;
            }
        }

        e.preventDefault();
        e.stopPropagation();
    };

    TileSelectionPopup.prototype.setSelectionMarker = function ()
    {
        var rect = Rectangle.fromPoints(this.selectionRange.x1, this.selectionRange.y1, this.selectionRange.x2, this.selectionRange.y2);

        this.brush.x = Math.floor(rect.left / this.spriteSheet.tileWidth);
        this.brush.y = Math.floor(rect.top / this.spriteSheet.tileHeight);
        this.brush.width = Math.ceil(rect.right / this.spriteSheet.tileWidth) - this.brush.x;
        this.brush.height = Math.ceil(rect.bottom / this.spriteSheet.tileHeight) - this.brush.y;

        this.selectionMarker.style.display = 'block';
        this.selectionMarker.style.left = (this.brush.x * this.spriteSheet.tileWidth + 1) + 'px';
        this.selectionMarker.style.top = (this.brush.y * this.spriteSheet.tileHeight + 1) + 'px';
        this.selectionMarker.style.width = (this.brush.width * this.spriteSheet.tileWidth - 3) + 'px';
        this.selectionMarker.style.height = (this.brush.height * this.spriteSheet.tileHeight - 3) + 'px';
    };

    TileSelectionPopup.prototype.show = function (x, y)
    {
        if (activePopup)
            activePopup.close();

        this.element = document.createElement('div');
        this.element.className = 'popup';

        this.selectionMarker = document.createElement('div');
        this.selectionMarker.className = 'selection-marker';

        this.element.appendChild(this.spriteSheet.image.data);
        this.element.appendChild(this.selectionMarker);
        document.body.appendChild(this.element);

        var elementWidth = this.element.offsetWidth;
        var elementHeight = this.element.offsetHeight;
        var maxWidth = document.body.clientWidth;
        var maxHeight = document.body.clientHeight;

        this.left = Utility.clamp(x - elementWidth / 2, 0, maxWidth - elementWidth);
        this.top = Utility.clamp(y - elementHeight / 2, 0, maxHeight - elementHeight);

        this.element.style.top = this.top + 'px';
        this.element.style.left = this.left + 'px';
        this.element.style.maxWidth = maxWidth + 'px';
        this.element.style.maxHeight = maxHeight + 'px';

        var onMouseAction = this.onMouseAction.bind(this);
        this.element.addEventListener('mousedown', onMouseAction, false);
        this.element.addEventListener('mousemove', onMouseAction, false);
        this.element.addEventListener('mouseup', onMouseAction, false);

        activePopup = this;
        return this;
    };

    window.addEventListener('mousedown', function (e)
    {
        if (activePopup && !Utility.findParent(e.target, '.popup'))
            activePopup.close();
    }, false);

    Events.register(TileSelectionPopup.prototype);
    return TileSelectionPopup;
});
