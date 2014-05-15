define(['renderer/src/effects/blinkEffect'], function (BlinkEffect)
{
    'use strict';

    function RenderablePath(id, nodes, isSelected)
    {
        this.id = id;
        this.nodes = nodes;
        this.colorArray = ['rgba('];
        this.strokeArray = ['rgba('];

        if (id === 'attack' || id === 'selectedAttackNodes')
        {
            this.colorArray.push(0, ',', 110, ',', 0, ',');
            this.strokeArray.push(0, ',', 40, ',', 0, ',');
        }
        else
        {
            this.colorArray.push(217, ',', 145, ',', 0, ',');
            this.strokeArray.push(95, ',', 58, ',', 0, ',');
        }

        if (isSelected)
        {
            this.style = {opacity: 1};
            BlinkEffect.blink(this, 1.5);
        }
        else
        {
            this.style = {opacity: 0.4};
        }

        this.colorArray[9] = ')';
        this.strokeArray[9] = ')';
    }

    RenderablePath.prototype.render = function (context, camera)
    {
        this.colorArray[8] = this.style.opacity;
        this.strokeArray[8] = this.style.opacity;

        context.lineWidth = 1;
        context.fillStyle = this.colorArray.join('');
        context.strokeStyle = this.strokeArray.join('');

        for (var i = 0; i < this.nodes.length; ++i)
        {
            var node = this.nodes[i];
            var position = camera.tileToScreen(node.x, node.y);

            var left = position.x - camera.viewportRect.x + 2;
            var top = position.y - camera.viewportRect.y + 2;

            if (!camera.isInView(left, top, camera.tileWidth, camera.tileHeight))
                continue;

            var right = left + camera.tileWidth - 4;
            var bottom = top + camera.tileHeight - 4;
            var xCenter = (left + right) / 2;
            var yCenter = (top + bottom) / 2;

            if (node.occlusionPercentage)
                context.globalAlpha = 0.2 + node.occlusionPercentage;
            else
                context.globalAlpha = 1;

            context.beginPath();
            context.moveTo(xCenter, top);
            context.lineTo(right, yCenter);
            context.lineTo(xCenter, bottom);
            context.lineTo(left, yCenter);
            context.closePath();
            context.fill();
            context.stroke();
        }

        context.globalAlpha = 1;
    };

    return RenderablePath;
});
