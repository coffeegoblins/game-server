define(function ()
{
    'use strict';

    function RenderablePath(nodes, maxDistance)
    {
        this.nodes = nodes;
        this.maxDistance = maxDistance;
    }

    RenderablePath.prototype.render = function (context, scale, viewportRect)
    {
        for (var i = 0; i < this.nodes.length; ++i)
        {
            // + 100 so it's not black
            var numericColor = Math.floor(155 * (this.nodes[i].distance / this.maxDistance)) + 100;

            context.beginPath();
            context.fillStyle = "rgba(0," + numericColor + ",0,0.4)";
            context.rect(this.nodes[i].x * scale + 1 - viewportRect.x, this.nodes[i].y * scale + 1 - viewportRect.y, scale - 1, scale - 1);
            context.fill();
        }
    };

    return RenderablePath;
});