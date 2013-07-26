define(['core/game'], function (Game)
{
    'use strict';

    function Renderer()
    {
        this.canvas = null;
        this.context = null;
        this.viewportRect = {x: 0, y: 0, width: 0, height: 0};

        window.addEventListener('resize', handleResize.bind(this));
        Game.scheduleEvent({context: this, method: update});
    }

    function handleResize()
    {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.viewportRect.width = this.canvas.width;
        this.viewportRect.height = this.canvas.height;
    }

    function update(deltaTime)
    {
        this.context.clearRect(0, 0, this.viewportRect.width, this.viewportRect.height);

        var halfWidth = this.viewportRect.width / 2;
        var halfHeight = this.viewportRect.height / 2;

        this.context.fillStyle = 'blue';
        this.context.strokeStyle = 'blue';

        this.context.beginPath();
        this.context.arc(halfWidth, halfHeight, 300, 0, Math.PI * 2, false);
        this.context.stroke();

        this.context.fillStyle = 'blue';
        this.context.strokeStyle = 'black';

        this.context.beginPath();
        this.context.arc(halfWidth - 90, halfHeight - 60, 25, 0, Math.PI * 2, false);
        this.context.fill();
        this.context.stroke();

        this.context.beginPath();
        this.context.arc(halfWidth + 90, halfHeight - 60, 25, 0, Math.PI * 2, false);
        this.context.fill();
        this.context.stroke();

        this.context.beginPath();
        this.context.arc(halfWidth, halfHeight - 250, 400, Math.PI * 0.35, Math.PI * 0.65, false);
        this.context.stroke();
    }

    Renderer.prototype.setCanvas = function (canvas)
    {
        this.canvas = canvas;
        this.context = canvas.getContext('2d'); // TODO: If this doesn't work, tell the user their browser sucks and exit gracefully

        handleResize.call(this);
    };

    return new Renderer();
});