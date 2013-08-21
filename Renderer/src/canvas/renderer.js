define(['Game/src/inputHandler', 'Game/src/scheduler', 'Renderer/src/canvas/renderableMap', 'Renderer/src/canvas/renderableSoldier', 'Renderer/src/camera/camera'],
    function (InputHandler, Scheduler, RenderableMap, RenderableSoldier, Camera)
    {
        'use strict';

        function Renderer()
        {
            this.canvas = null;
            this.context = null;

            this.scale = 1; // TODO: It may be better to scale the canvas instead of the drawing in some cases
            this.camera = new Camera();

            this.renderableMap = null;
            this.renderables = [];

            InputHandler.registerEvent('canvas', onClick, this);
        }

        function handleResize()
        {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            this.camera.handleResize(this.canvas.clientWidth, this.canvas.clientHeight);
        }

        function onClick(e, x, y)
        {
            console.log("Clicked! \n\tX: " + x + "\n\t" + "Y: " + y);
            console.log(this.renderableMap.gameMap.getTileAtCoordinate(x, y));
        }

        function update(e, deltaTime)
        {
            this.context.clearRect(0, 0, this.camera.viewportRect.width, this.camera.viewportRect.height);

            this.camera.update(e, deltaTime);

            if (this.renderableMap)
            {
                // TODO: It may be nice to combine this in with the other renderables, but it will have to render the map first
                this.renderableMap.render(this.context, this.scale, this.camera.viewportRect);
            }

            for (var i = 0; i < this.renderables.length; i++)
            {
                this.renderables[i].render(this.context, this.scale, this.camera.viewportRect);
            }
        }

        Renderer.prototype.addRenderableMap = function (renderableMap)
        {
            this.renderableMap = new RenderableMap(renderableMap);
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