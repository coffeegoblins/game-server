define([], function ()
{
    'use strict';

    function RenderableSoldier(soldier)
    {
        this.soldier = soldier;
        this.soldierWidthOffset = 25; // Width / 2
        this.soldierHeightOffset = 25;
    }

    RenderableSoldier.prototype.render = function (context, scale, viewportRect)
    {
        context.beginPath();
        context.fillStyle = '#345';
        context.rect(this.soldier.CurrentTile.xPosition - this.soldierWidthOffset - viewportRect.x,
                     this.soldier.CurrentTile.yPosition - this.soldierHeightOffset - viewportRect.y,
                     this.soldierWidthOffset * 2,
                     this.soldierHeightOffset * 2);
        context.fill();
    };

    return RenderableSoldier;
});