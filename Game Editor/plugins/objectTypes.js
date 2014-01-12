define(function ()
{
    'use strict';

    function DefaultObject() { }

    DefaultObject.type = 'object';

    DefaultObject.prototype.draw = function (viewport)
    {
        viewport.context.strokeStyle = '#cdcdcd';

        var x = Math.floor((this.rect.x - viewport.rect.left) * viewport.scale);
        var y = Math.floor((this.rect.y - viewport.rect.top) * viewport.scale);
        var width = Math.floor(this.rect.width * viewport.scale);
        var height = Math.floor(this.rect.height * viewport.scale);

        viewport.context.beginPath();
        viewport.context.rect(x, y, width, height);
        viewport.context.stroke();
    };

    return [DefaultObject];
});