define(['Renderer/src/effects/transitionEffect', 'Game/src/utility'],
    function (TransitionEffect, Utility)
    {
        'use strict';
        function RenderableTurnQueue()
        {
            this.images = {
                'archer': 'Renderer/content/archer.png',
                'swordAndShield': 'Renderer/content/soldier.png',
                'twoHanded': 'Renderer/content/soldier.png',
                'dualWield': 'Renderer/content/soldier.png'
            };

            this.unitList = [];
            this.element = document.createElement('div');
            this.element.id = 'turnQueue';
            document.body.appendChild(this.element);
        }

        RenderableTurnQueue.prototype.handleResize = function (width, height)
        {
            this.isLandscapeMode = width > height;
            this.imageSize = null;
        };

        RenderableTurnQueue.prototype.addUnit = function (unit, position)
        {
            var image = document.createElement('img');
            image.id = unit.name;
            image.src = this.images[unit.type];

            if (position == null)
                position = 0;

            this.element.insertBefore(image, this.element.children[position]);
        };

        RenderableTurnQueue.prototype.insertUnit = function (unit, position)
        {
            var image = document.createElement('img');
            image.id = unit.name;
            image.src = this.images[unit.type];

            this.element.insertBefore(image, this.element.children[position]);

            var styleName = (Utility.isTouchEnabled() && this.isLandscapeMode) ? 'width' : 'height';
            if (!this.imageSize)
            {
                var style = window.getComputedStyle(image);
                this.imageSize = parseFloat(style[styleName]);
            }

            image.style[styleName] = 0;
            image.style.opacity = 0;

            TransitionEffect.transitionFloat("TurnManagerInsertHeight", image.style, styleName, "px", this.imageSize, 1, this, function ()
            {
                TransitionEffect.transitionFloat("TurnManagerInsertOpacity", image.style, "opacity", null, 1, 0.5, this, function ()
                {
                    image.style.opacity = 1;
                });
            });
        };

        RenderableTurnQueue.prototype.onEndTurn = function (activeUnit, placementIndex)
        {
            this.insertUnit(activeUnit, placementIndex);
        };

        RenderableTurnQueue.prototype.onBeginTurn = function (activeUnit)
        {
            var styleName = (Utility.isTouchEnabled() && this.isLandscapeMode) ? 'width' : 'height';

            this.element.firstChild.style.width = this.element.firstChild.width + "px";
            this.element.firstChild.style.height = this.element.firstChild.height + "px";

            TransitionEffect.transitionFloat("TurnManagerRemove", this.element.firstChild.style, styleName, "px", 0, 1, this, function ()
            {
                this.element.removeChild(this.element.firstChild);
            });
        };

        return new RenderableTurnQueue();
    });