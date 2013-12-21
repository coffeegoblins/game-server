define(['Renderer/src/effects/transitionEffect', 'Game/src/utility'],
    function (TransitionEffect, Utility)
    {
        'use strict';
        function RenderableTurnQueue()
        {
            this.unitList = [];
            this.element = document.createElement('div');
            this.element.id = 'turnQueue';
            document.body.appendChild(this.element);
        }

        RenderableTurnQueue.prototype.addUnit = function (unit)
        {
            this.element.appendChild(this.createUnitElement(unit));
            unit.on('death', this, this.removeUnit);
        };

        RenderableTurnQueue.prototype.createUnitElement = function (unit)
        {
            var container = document.createElement('div');
            container.id = unit.name;
            container.className = 'turn-queue-preview team-' + unit.player.color;

            var preview = document.createElement('div');
            preview.className = 'unit-preview unit-type-' + unit.weapon.type;
            container.appendChild(preview);

            return container;
        };

        RenderableTurnQueue.prototype.getResizeStyleProperty = function (image)
        {
            var styleName = (Utility.isTouchEnabled() && this.isLandscapeMode) ? 'width' : 'height';
            if (!this.imageSize)
            {
                var style = window.getComputedStyle(image);
                this.imageSize = parseFloat(style[styleName]);
            }

            return styleName;
        };

        RenderableTurnQueue.prototype.handleResize = function (width, height)
        {
            this.isLandscapeMode = width > height;
            this.imageSize = null;
        };

        RenderableTurnQueue.prototype.insertUnit = function (unit, position)
        {
            unit.on('death', this, this.removeUnit);

            var element = this.createUnitElement(unit);
            this.element.insertBefore(element, this.element.children[position]);

            var styleName = this.getResizeStyleProperty(element);
            element.style[styleName] = 0;
            element.style.opacity = 0;

            TransitionEffect.transitionFloat("TurnManagerInsertHeight", element.style, styleName, "px", this.imageSize, 1, this, function ()
            {
                TransitionEffect.transitionFloat("TurnManagerInsertOpacity", element.style, "opacity", null, 1, 0.5, this, function ()
                {
                    element.style.opacity = 1;
                });
            });
        };

        RenderableTurnQueue.prototype.onBeginTurn = function ()
        {
            var styleName = (Utility.isTouchEnabled() && this.isLandscapeMode) ? 'width' : 'height';

            this.element.firstChild.style.width = this.element.firstChild.width + "px";
            this.element.firstChild.style.height = this.element.firstChild.height + "px";

            TransitionEffect.transitionFloat("TurnManagerRemove", this.element.firstChild.style, styleName, "px", 0, 1, this, function ()
            {
                this.element.removeChild(this.element.firstChild);
            });
        };

        RenderableTurnQueue.prototype.onEndTurn = function (activeUnit, placementIndex)
        {
            this.insertUnit(activeUnit, placementIndex);
        };

        RenderableTurnQueue.prototype.removeUnit = function (unit)
        {
            var image = document.getElementById(unit.name);
            var styleName = this.getResizeStyleProperty(image);

            TransitionEffect.transitionFloat("TurnManagerInsertHeight", image.style, styleName, "px", 0, 1, this, function ()
            {
                this.element.removeChild(image);
            });
        };

        return new RenderableTurnQueue();
    });