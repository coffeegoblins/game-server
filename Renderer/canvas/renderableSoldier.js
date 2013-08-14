define([], function ()
{
    'use strict';

    function RenderableSoldier(soldier)
    {
        this.soldier = soldier;
    }

    RenderableSoldier.prototype.render = function (context, scale, viewportRect)
    {
        context.beginPath();
        context.fillStyle = '#345';
        context.rect(this.soldier.PositionX, this.soldier.PositionY, 50, 50);
        context.fill();
    };

    return RenderableSoldier;
});