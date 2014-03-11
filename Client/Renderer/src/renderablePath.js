define(['Renderer/src/effects/blinkEffect'], function (BlinkEffect)
{
    'use strict';

    function RenderablePath(id, nodes, isSelected)
    {
        this.id = id;
        this.nodes = nodes;

        this.style = {};
        if (id === 'attack')
        {
            this.colorArray = [75, 155, 75];
            this.style.opacity = 0.4;
        }
        else if (isSelected)
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

    RenderablePath.prototype.render = function (context, camera)
    {
        this.colorArray[3] = this.style.opacity;
        context.fillStyle = 'rgba(' + this.colorArray.join() + ')';

        for (var i = 0; i < this.nodes.length; ++i)
        {
            var node = this.nodes[i];
            var position = camera.tileToScreen(node.x, node.y);

            var left = position.x - camera.viewportRect.x + 1;
            var top = position.y - camera.viewportRect.y + 1;
            var right = left + camera.tileWidth - 2;
            var bottom = top + camera.tileHeight - 2;
            var xCenter = (left + right) / 2;
            var yCenter = (top + bottom) / 2;

            context.beginPath();
            context.moveTo(xCenter, top);
            context.lineTo(right, yCenter);
            context.lineTo(xCenter, bottom);
            context.lineTo(left, yCenter);
            context.closePath();
            context.fill();
        }
    };

    return RenderablePath;
});
