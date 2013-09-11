define(function ()
{
    'use strict';

    function RenderablePath(id, nodes, r, g, b, a)
    {
        this.id = id;
        this.nodes = nodes;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;

        this.maxDistance = 0;

        for (var i = 0; i < this.nodes.length; ++i)
        {
            if (this.nodes[i].distance > this.maxDistance)
                this.maxDistance = this.nodes[i].distance;
        }
    }

    RenderablePath.prototype.render = function (context, scale, viewportRect)
    {
        for (var i = 0; i < this.nodes.length; ++i)
        {
            context.beginPath();
            context.fillStyle = "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
            context.rect(this.nodes[i].x * scale + 1 - viewportRect.x, this.nodes[i].y * scale + 1 - viewportRect.y, scale - 1, scale - 1);
            context.fill();
        }
    };

    return RenderablePath;
});