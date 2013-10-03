define(['Renderer/src/effects/transitionEffect'],
function (TransitionEffect)
{
    'use strict';
    function RenderableTurnQueue()
    {
        this.images = {
            'Archer': 'Renderer/content/awesome.png',
            'Melee': 'Renderer/content/awesomeSad.png'
        };

        this.unitList = [];

        this.element = document.createElement('div');
        this.element.id = 'turnQueue';

        document.body.appendChild(this.element);
    }

    RenderableTurnQueue.prototype.handleResize = function (width, height)
    {
        this.viewportWidth = width;
        this.viewportHeight = height;
    };

    RenderableTurnQueue.prototype.addUnit = function (unit, position)
    {
        var image = document.createElement('img');
        image.id = unit.name;
        image.src = this.images[unit.type];

        this.element.insertBefore(image, this.element.children[position]);
    };

    RenderableTurnQueue.prototype.insertUnit = function (unit, position)
    {
        var image = document.createElement('img');
        image.id = unit.name;
        image.src = this.images[unit.type];

        this.element.insertBefore(image, this.element.children[position]);

        var styleHeight = 64;

        image.style.height = 0;
        image.style.opacity = 0;

        TransitionEffect.transitionFloat("TurnManagerInsertHeight", image.style, "height", "px", styleHeight, 1, this, null);
        TransitionEffect.transitionFloat("TurnManagerInsertOpacity", image.style, "opacity", null, 1, 0.5, this, function()
        {
            image.style.opacity = 1;
        });
    };

    RenderableTurnQueue.prototype.onEndTurn = function(activeUnit, placementIndex)
    {
        this.insertUnit(activeUnit, placementIndex);
    };

    RenderableTurnQueue.prototype.onBeginTurn = function(activeUnit)
    {
        this.element.firstChild.style.height = this.element.firstChild.height + "px";

        TransitionEffect.transitionFloat("TurnManagerRemove", this.element.firstChild.style, "height", "px", 0, 1, this, function()
        {
            this.element.removeChild(this.element.firstChild);
        });
    };

    return new RenderableTurnQueue();
});