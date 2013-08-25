define(['Game/src/inputHandler', 'Game/src/scheduler', 'Renderer/src/canvas/renderableMap', 'Renderer/src/canvas/renderableObject', 'Renderer/src/canvas/renderableSoldier', 'Renderer/src/camera/camera'],
    function (InputHandler, Scheduler, RenderableMap, RenderableObject, RenderableSoldier, Camera)
    {
        'use strict';

        function Renderer()
        {
            this.canvas = null;
            this.context = null;

            this.scale = 64; // TODO: It may be better to scale the canvas instead of the drawing in some cases
            this.camera = new Camera();
            this.camera.scale = this.scale;

            this.renderableMap = null;
            this.renderables = [];

            InputHandler.registerEvent('canvas', onClick, this);
        }


        function handleResize()
        {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.camera.handleResize(this.canvas.width, this.canvas.height);
        }

        function onClick(e, x, y)
        {
            console.log("Clicked! \n\tX: " + x + "\n\t" + "Y: " + y);
            console.log(this.renderableMap.getTileAtCoordinate(x, y, this.scale));
        }

        function update(e, deltaTime)
        {
            this.context.clearRect(0, 0, this.camera.viewportRect.width, this.camera.viewportRect.height);

            this.camera.update(e, deltaTime);

            if (!this.renderableMap)
                return;

            var map = this.renderableMap;
            map.render(this.context, this.scale, this.camera.viewportRect);

            for (var i = 0; i < this.renderables.length; i++)
            {
                var renderable = this.renderables[i];
                if (renderable.isVisible(map.visibleTileLeft, map.visibleTileRight, map.visibleTileTop, map.visibleTileBottom))
                {
                    renderable.render(this.context, this.scale, this.camera.viewportRect);
                }
            }
        }


        Renderer.prototype.addRenderableMap = function (renderableMap)
        {
            this.renderableMap = new RenderableMap(renderableMap);
        };

        Renderer.prototype.addRenderableObject = function (object)
        {
            this.renderables.unshift(new RenderableObject(object));
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