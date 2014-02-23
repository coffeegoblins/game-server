define(['renderer', 'Core/src/utility'], function (Renderer, Utility)
{
    'use strict';
    function RenderableTurnQueue(element)
    {
        this.units = [];
        this.element = element;

        this.handleResize(window.innerWidth, window.innerHeight);
        Renderer.on('resize', this, this.handleResize);
    }

    RenderableTurnQueue.prototype.addUnit = function (unit)
    {
        var unitData = {unit: unit};
        unitData.element = document.createElement('div');
        unitData.element.className = 'turn-queue-preview';

        var backgroundElement = document.createElement('div');
        if (unit.player.isLocal)
            backgroundElement.className = 'container player-team';
        else
            backgroundElement.className = 'container enemy-team';

        unitData.imageElement = document.createElement('div');
        unitData.imageElement.className = 'unit-preview unit-type-' + unit.weapon.type;

        backgroundElement.appendChild(unitData.imageElement);
        unitData.element.appendChild(backgroundElement);
        this.element.appendChild(unitData.element);

        unit.on('death', this, this.removeUnit);
        this.units.push(unitData);
    };

    RenderableTurnQueue.prototype.fadeIn = function (unitData)
    {
        var dimension = (Utility.isMobile && this.isLandscapeMode) ? 'width' : 'height';
        setTimeout(function ()
        {
            unitData.imageElement.style.opacity = 1;
            unitData.element.style[dimension] = '';
        }, 0);
    };

    RenderableTurnQueue.prototype.fadeOut = function (unitData)
    {
        var dimension = (Utility.isMobile && this.isLandscapeMode) ? 'width' : 'height';
        setTimeout(function ()
        {
            unitData.imageElement.style.opacity = 0;
            unitData.element.style[dimension] = '0px';
        }, 0);
    };

    RenderableTurnQueue.prototype.handleResize = function (width, height)
    {
        this.isLandscapeMode = (width > height);
        this.imageSize = null;
    };

    RenderableTurnQueue.prototype.onBeginTurn = function ()
    {
        this.fadeOut(this.units[0]);
    };

    RenderableTurnQueue.prototype.onEndTurn = function (unit, position)
    {
        var unitData = Utility.getElementByProperty(this.units, 'unit', unit);
        if (!unitData)
            return;

        if (position < this.units.length - 1)
        {
            this.element.insertBefore(unitData.element, this.units[position + 1].element);
            this.units.splice(position, 0, this.units.shift());
        }
        else
        {
            this.units.push(this.units.shift());
            this.element.appendChild(unitData.element);
        }

        this.fadeIn(unitData);
    };

    RenderableTurnQueue.prototype.removeUnit = function (unit)
    {
        var unitData = Utility.removeElementByProperty(this.units, 'unit', unit);
        if (unitData)
        {
            this.fadeOut(unitData);
            unitData.element.addEventListener('transitionend', function ()
            {
                this.element.removeChild(unitData.element);
            }.bind(this));
        }
    };

    return RenderableTurnQueue;
});