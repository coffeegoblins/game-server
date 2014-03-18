define([
        'Core/src/eventManager',
        'Core/src/inputHandler',
        'Core/src/scheduler',
        'Core/src/utility',
        'Renderer/src/renderableMap',
        'Renderer/src/renderableLadder',
        'Renderer/src/renderableObject',
        'Renderer/src/renderableSoldier',
        'Renderer/src/camera/camera',
        'Renderer/src/renderablePath'
    ],
    function (Events, InputHandler, Scheduler, Utility, RenderableMap, RenderableLadder, RenderableObject, RenderableSoldier, Camera, RenderablePath)
    {
        'use strict';

        function Renderer()
        {
            this.camera = new Camera();
            this.renderables = [];
            this.renderablePaths = [];

            Events.register(this);
            this.onResize = onResize.bind(this);
        }

        function onResize()
        {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.camera.handleResize(this.canvas.width, this.canvas.height);
            this.trigger('resize', this.canvas.width, this.canvas.height);
        }

        Renderer.prototype.onClick = function (e)
        {
            if (this.renderableMap)
            {
                var position = this.camera.screenToTile(e.pageX + this.camera.viewportRect.x, e.pageY + this.camera.viewportRect.y);
                this.renderableMap.onClick(e, position.x, position.y);
            }
        };

        Renderer.prototype.onDrag = function (e, deltaX, deltaY)
        {
            this.camera.moveViewport(deltaX, deltaY);
        };

        Renderer.prototype.update = function (e, deltaTime)
        {
            this.context.clearRect(0, 0, this.camera.viewportRect.width, this.camera.viewportRect.height);
            if (!this.renderableMap)
                return;

            this.camera.update(deltaTime);

            var map = this.renderableMap;
            map.render(this.context, this.camera);

            // Pathing needs to be drawn after the map and before the objects
            for (var i = 0; i < this.renderablePaths.length; i++)
                this.renderablePaths[i].render(this.context, this.camera);

            for (i = 0; i < this.renderables.length; i++)
            {
                var renderable = this.renderables[i];
                //if (renderable.isVisible(map.visibleTileLeft, map.visibleTileRight, map.visibleTileTop, map.visibleTileBottom))
                {
                    renderable.render(this.context, deltaTime, this.camera);
                }
            }
        };

        Renderer.prototype.addRenderableMap = function (renderableMap)
        {
            this.renderableMap = new RenderableMap(renderableMap);
        };

        Renderer.prototype.addRenderableLadder = function (ladder)
        {
            this.renderables.unshift(new RenderableLadder(ladder));
        };

        Renderer.prototype.addRenderableObject = function (object)
        {
            this.renderables.unshift(new RenderableObject(object));
        };

        Renderer.prototype.addRenderablePath = function (id, nodes, isSelected)
        {
            this.renderablePaths.push(new RenderablePath(id, nodes, isSelected));
        };

        Renderer.prototype.addRenderableSoldier = function (soldier)
        {
            var renderableSoldier = new RenderableSoldier(soldier);
            this.renderables.push(renderableSoldier);

            soldier.on('death', this, function ()
            {
                // Push dead units to the front of the draw list
                Utility.removeElement(this.renderables, renderableSoldier);

                for (var i = 0; i < this.renderables.length; i++)
                {
                    var renderable = this.renderables[i];
                    if (renderable instanceof RenderableSoldier && !renderable.unit.isAlive())
                        continue;

                    this.renderables.splice(i, 0, renderableSoldier);
                    break;
                }
            });
        };

        Renderer.prototype.clearRenderablePaths = function ()
        {
            this.renderablePaths = [];
        };

        Renderer.prototype.clearRenderablePathById = function (id)
        {
            Utility.removeElementByProperty(this.renderablePaths, 'id', id);
        };

        Renderer.prototype.initialize = function ()
        {
            this.canvas = document.getElementById('canvas');
            this.context = this.canvas.getContext('2d');

            this.renderables.length = 0;
            this.renderablePaths.length = 0;

            InputHandler.on('drag', this, this.onDrag);
            InputHandler.registerClickEvent('canvas', this.onClick, this);
            window.addEventListener('resize', this.onResize, false);

            this.onResize();
            Scheduler.schedule({context: this, method: this.update, priority: Scheduler.priority.render});
        };

        Renderer.prototype.uninitialize = function ()
        {
            InputHandler.off('drag', this);
            InputHandler.unregisterClickEvent('canvas');
            window.removeEventListener('resize', this.onResize, false);
        };

        return new Renderer();
    });