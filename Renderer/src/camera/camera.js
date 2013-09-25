define(['Renderer/src/effects/transitionEffect'], function (TransitionEffect)
{
    'use strict';

    function Camera()
    {
        this.viewportRect = {x: 0, y: 0, width: 0, height: 0};
        this.centerX = 0;
        this.centerY = 0;
        this.scale = 64; // TODO: It may be better to scale the canvas instead of the drawing in some cases
    }

    Camera.prototype.handleResize = function (width, height)
    {
        var currentCenterX = this.viewportRect.x + this.viewportRect.width / 2;
        var currentCenterY = this.viewportRect.y + this.viewportRect.height / 2;

        this.viewportRect.width = width;
        this.viewportRect.height = height;

        this.viewportRect.x = currentCenterX - width / 2;
        this.viewportRect.y = currentCenterY - height / 2;

        if (this.targetUnit)
            this.moveToUnit(this.targetUnit);
    };

    Camera.prototype.onBeginTurn = function (unit)
    {
        this.moveToUnit(unit);
    };

    Camera.prototype.moveToUnit = function (unit)
    {
        var offset = this.scale / 2;

        this.targetUnit = unit;

        TransitionEffect.transitionFloat("moveToUnitX", this.viewportRect, 'x', null, unit.tileX * this.scale + offset - this.viewportRect.width / 2, 1, this, this.onMovedToUnit);
        TransitionEffect.transitionFloat("moveToUnitY", this.viewportRect, 'y', null, unit.tileY * this.scale + offset - this.viewportRect.height / 2, 1, this, this.onMovedToUnit);
    };

    Camera.prototype.onMovedToUnit = function()
    {
        this.targetUnit = null;
    };

    return Camera;
});