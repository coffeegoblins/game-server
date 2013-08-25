define(function ()
{
    'use strict';

    function RenderableSoldier(soldier)
    {
        this.soldier = soldier;
    }

    RenderableSoldier.prototype.isVisible = function(left, right, top, bottom)
    {
        return  this.soldier.tileX <= right &&
                this.soldier.tileY <= bottom &&
                this.soldier.tileX >= left &&
                this.soldier.tileY >= top;
    };

    RenderableSoldier.prototype.render = function (context, scale, viewportRect)
    {
        var size = Math.floor(scale * 0.75);
        var offset = 1 + ((scale - size) / 2);

        var xPosition = this.soldier.tileX * scale + offset - viewportRect.x;
        var yPosition = this.soldier.tileY * scale + offset - viewportRect.y;

        context.beginPath();
        context.fillStyle = '#345';
        context.rect(xPosition, yPosition, size, size);
        context.fill();
    };

    return RenderableSoldier;
});