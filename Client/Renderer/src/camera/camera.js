define(['Renderer/src/effects/transitionEffect'], function (TransitionEffect)
{
    'use strict';

    function Camera()
    {
        this.viewportRect = {x: 0, y: 0, width: 0, height: 0};
        this.scale = 64; // TODO: It may be better to scale the canvas instead of the drawing in some cases
    }

    Camera.prototype.handleResize = function (width, height)
    {
        var currentCenterX = this.viewportRect.x + this.viewportRect.width / 2;
        var currentCenterY = this.viewportRect.y + this.viewportRect.height / 2;

        this.viewportRect.width = width;
        this.viewportRect.height = height;

        this.viewportRect.x = Math.floor(currentCenterX - width / 2);
        this.viewportRect.y = Math.floor(currentCenterY - height / 2);

        if (this.targetUnit)
            this.moveToUnit(this.targetUnit, this.callback);
    };

    Camera.prototype.moveViewport = function (deltaX, deltaY)
    {
        this.viewportRect.x = Math.floor(this.viewportRect.x + deltaX);
        this.viewportRect.y = Math.floor(this.viewportRect.y + deltaY);
    };

    Camera.prototype.moveToUnit = function (unit, callback, duration)
    {
        var offset = this.scale / 2;
        var xPosition = Math.floor(unit.tileX * this.scale + offset - this.viewportRect.width / 2);
        var yPosition = Math.floor(unit.tileY * this.scale + offset - this.viewportRect.height / 2);

        if (Math.abs(this.viewportRect.x - xPosition) < 10 && Math.abs(this.viewportRect.y - yPosition) < 10)
            return;

        this.targetUnit = unit;
        this.callback = callback;

        var transition = {
            id: 'moveToUnitX',
            source: this.viewportRect,
            property: 'x',
            duration: duration || 1,
            targetValue: xPosition,
            truncateValue: true
        };

        TransitionEffect.transitionFloat(transition);

        transition.id = 'moveToUnitY';
        transition.property = 'y';
        transition.targetValue = yPosition;
        transition.context = this;
        transition.completedMethod = this.onMovedToUnit;

        TransitionEffect.transitionFloat(transition);
    };

    Camera.prototype.onMovedToUnit = function ()
    {
        var unit = this.targetUnit;
        this.targetUnit = null;

        if (this.callback)
        {
            this.callback(unit);
            this.callback = null;
        }
    };

    Camera.prototype.trackUnit = function (unit)
    {
        this.trackedUnit = unit;
    };

    Camera.prototype.update = function ()
    {
        if (this.trackedUnit)
            this.moveToUnit(this.trackedUnit, null, 0.5);
    };

    return Camera;
});