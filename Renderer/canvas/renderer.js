define(['Game/src/scheduler', 'Renderer/canvas/renderableMap', 'Renderer/canvas/renderableSoldier'], function (Scheduler, RenderableMap, RenderableSoldier)
{
    'use strict';

    function Renderer()
    {
        this.canvas = null;
        this.context = null;

        this.scale = 1; // TODO: It may be better to scale the canvas instead of the drawing
        this.viewportRect = {x: 0, y: 0, width: 0, height: 0};

        this.map = null;
        this.renderables = [];
    }

    function handleResize()
    {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.viewportRect.width = this.canvas.clientWidth;
        this.viewportRect.height = this.canvas.clientHeight;
    }

    function update(e, deltaTime)
    {
        this.context.clearRect(0, 0, this.viewportRect.width, this.viewportRect.height);

        if (this.map)
        { // TODO: It may be nice to combine this in with the other renderables, but it will have to Renderer first
            this.map.render(this.context, this.scale, this.viewportRect);
        }

        for (var i = 0; i < this.renderables.length; i++)
        {
            this.renderables[i].render(this.context, this.scale, this.viewportRect);
        }
    }

    Renderer.prototype.addRenderableMap = function (renderableMap)
    {
        this.map = new RenderableMap(renderableMap);
    };

    Renderer.prototype.addRenderableSoldier = function (soldier)
    {
        this.renderables.push(new RenderableSoldier(soldier));
    };

    Renderer.prototype.initialize = function (canvas)
    {
        this.canvas = canvas;
        this.context = canvas.getContext('2d'); // TODO: If this doesn't work, tell the user their browser sucks and exit gracefully

        handleResize.call(this);
        window.addEventListener('resize', handleResize.bind(this));
        Scheduler.schedule({context: this, method: update, priority: Scheduler.priority.render});
    };

    return new Renderer();
});