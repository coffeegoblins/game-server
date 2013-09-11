define(['Game/src/inputHandler', 'Game/src/scheduler', 'Renderer/src/renderableMap', 'Renderer/src/renderableObject',
        'Renderer/src/renderableSoldier', 'Renderer/src/camera/camera', 'Renderer/src/renderablePath'],
    function (InputHandler, Scheduler, RenderableMap, RenderableObject, RenderableSoldier, Camera, RenderablePath)
    {
        'use strict';

        function Renderer()
        {
            this.canvas = null;
            this.context = null;

            this.camera = new Camera();
            this.renderableMap = null;
            this.renderables = [];
            this.renderablePaths = [];

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
            this.renderableMap.onClick(e, x + this.camera.viewportRect.x, y + this.camera.viewportRect.y, this.camera.scale);
            //this.renderableMap.moveActiveUnit(x + this.camera.viewportRect.x, y + this.camera.viewportRect.y, this.camera.scale);
        }

        function update(e, deltaTime)
        {
            this.context.clearRect(0, 0, this.camera.viewportRect.width, this.camera.viewportRect.height);

            this.camera.update(e, deltaTime);

            if (!this.renderableMap)
                return;

            var map = this.renderableMap;
            map.render(this.context, this.camera.scale, this.camera.viewportRect);

            // Pathing needs to be drawn after the map and before the objects
            for (var i = 0; i < this.renderablePaths.length; i++)
            {
                this.renderablePaths[i].render(this.context, this.camera.scale, this.camera.viewportRect);
            }

            for (i = 0; i < this.renderables.length; i++)
            {
                var renderable = this.renderables[i];
                if (renderable.isVisible(map.visibleTileLeft, map.visibleTileRight, map.visibleTileTop, map.visibleTileBottom))
                {
                    renderable.render(this.context, this.camera.scale, this.camera.viewportRect);
                }
            }
        }

        Renderer.prototype.addRenderableMap = function (renderableMap)
        {
            this.renderableMap = new RenderableMap(renderableMap);
        };

        Renderer.prototype.clearRenderablePathById = function(id)
        {
            for (var i = 0; i < this.renderablePaths.length; ++i)
            {
                if (this.renderablePaths[i].id == id)
                {
                    this.renderablePaths.splice(i, 1);
                    return;
                }
            }
        };

        Renderer.prototype.addRenderablePath = function (id, nodes, r, g, b, a)
        {
            this.renderablePaths.push(new RenderablePath(id, nodes, r, g, b, a));
        };

        Renderer.prototype.addRenderableObject = function (object)
        {
            this.renderables.unshift(new RenderableObject(object));
        };

        Renderer.prototype.addRenderableSoldier = function (soldier, unitImage, previewImage)
        {
            this.renderables.push(new RenderableSoldier(soldier, unitImage, previewImage));
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