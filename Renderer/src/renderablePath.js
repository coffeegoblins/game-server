define(['Renderer/src/effects/blinkEffect'], function (BlinkEffect)
{
    'use strict';

    function RenderablePath(id, nodes, isSelected)
    {
        this.id = id;
        this.nodes = nodes;
        this.maxDistance = 0;

        for (var i = 0; i < this.nodes.length; ++i)
        {
            if (this.nodes[i].distance > this.maxDistance)
                this.maxDistance = this.nodes[i].distance;
        }

        this.style = {};
        if (isSelected)
        {
            this.colorArray = [255, 165, 0];
            this.style.opacity = 1;
            BlinkEffect.blink(this, 1.5);
        }
        else
        {
            this.colorArray = [255, 165, 0];
            this.style.opacity = 0.4;
        }
    }

    RenderablePath.prototype.render = function (context, deltaTime, scale, viewportRect)
    {
        this.colorArray[3] = this.style.opacity;
        context.fillStyle = 'rgba(' + this.colorArray.join() + ')';
        for (var i = 0; i < this.nodes.length; ++i)
        {
            context.beginPath();
            context.rect(this.nodes[i].x * scale + 1 - viewportRect.x, this.nodes[i].y * scale + 1 - viewportRect.y, scale - 1, scale - 1);
            context.fill();
        }
    };

    return RenderablePath;
});