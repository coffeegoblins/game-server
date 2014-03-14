define(['renderer', 'Core/src/eventManager', 'Core/src/inputHandler', 'Core/src/utility'], function (Renderer, EventManager, InputHandler, Utility)
{
    'use strict';
    function RenderableTurnQueue(element)
    {
        this.units = [];
        this.element = element;

        InputHandler.addClickListener(this.element, this.handleClick.bind(this));
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
        var dimension = this.isLandscapeMode ? 'width' : 'height';
        setTimeout(function ()
        {
            unitData.imageElement.style.opacity = 1;
            unitData.element.style[dimension] = '';
        }, 0);
    };

    RenderableTurnQueue.prototype.fadeOut = function (unitData)
    {
        var dimension = this.isLandscapeMode ? 'width' : 'height';
        setTimeout(function ()
        {
            unitData.imageElement.style.opacity = 0;
            unitData.element.style[dimension] = '0px';
        }, 0);
    };

    RenderableTurnQueue.prototype.handleClick = function (e)
    {
        // Get the topmost element
        var element = e.target;
        while (element && !element.classList.contains('turn-queue-preview'))
            element = element.parentNode;

        if (element)
        {
            var unitData = Utility.getElementByProperty(this.units, 'element', element);
            if (unitData)
                this.handleUnitSelection(unitData);
        }

        return false;
    };

    RenderableTurnQueue.prototype.handleResize = function (width, height)
    {
        var wasLandscapeMode = this.isLandscapeMode;
        this.isLandscapeMode = (Utility.isMobile && width > height);

        if (this.units.length && this.isLandscapeMode !== wasLandscapeMode)
        {
            var firstUnit = this.units[0];
            firstUnit.element.classList.add('no-transition');
            firstUnit.element.style.width = this.isLandscapeMode ? '0px' : '';
            firstUnit.element.style.height = this.isLandscapeMode ? '' : '0px';

            setTimeout(function ()
            {
                firstUnit.element.classList.remove('no-transition');
            }, 0);
        }
    };

    RenderableTurnQueue.prototype.handleUnitSelection = function (unitData)
    {
        if (unitData === this.selectedUnit)
            return;

        if (this.selectedUnit)
        {
            this.selectedUnit.unit.isTargeted = false;
            this.selectedUnit.element.querySelector('.container').classList.remove('selected');
            this.trigger('deselectUnit', this.selectedUnit.unit);
        }

        this.selectedUnit = unitData;
        if (this.selectedUnit)
        {
            this.selectedUnit.unit.isTargeted = true;
            this.selectedUnit.element.querySelector('.container').classList.add('selected');
            this.trigger('selectUnit', this.selectedUnit.unit);
        }
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
                if (unitData.element.parentNode)
                    unitData.element.parentNode.removeChild(unitData.element);
            });
        }
    };

    RenderableTurnQueue.prototype.select = function (unit)
    {
        var unitData;
        if (unit)
        {
            unitData = Utility.getElementByProperty(this.units, 'unit', unit);
        }

        this.handleUnitSelection(unitData);
    };

    EventManager.register(RenderableTurnQueue.prototype);
    return RenderableTurnQueue;
});