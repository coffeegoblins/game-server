define([
        'core/src/events',
        'core/src/inputHandler',
        'core/src/scheduler',
        'core/src/utility',
        'renderer/src/renderableMap',
        'renderer/src/renderableLadder',
        'renderer/src/renderableObject',
        'renderer/src/renderableSoldier',
        'renderer/src/camera/camera',
        'renderer/src/renderablePath'
    ],
    function (Events, InputHandler, Scheduler, Utility, RenderableMap, RenderableLadder, RenderableObject, RenderableSoldier, Camera, RenderablePath)
    {
        'use strict';

        function Renderer()
        {
            this.renderables = [];
            this.renderablePaths = [];

            Events.register(this);
            this.onResize = onResize.bind(this);
        }

        Renderer.prototype.initialize = function ()
        {
            this.canvas = document.getElementById('canvas');
            this.context = this.canvas.getContext('2d');

            this.camera = new Camera();
            this.renderables.length = 0;
            this.renderablePaths.length = 0;

            InputHandler.on('drag', this, this.onDrag);
            InputHandler.registerClickEvent('canvas', this.onClick, this);
            window.addEventListener('resize', this.onResize, false);

            this.onResize();
            Scheduler.schedule({id: 'renderer', context: this, method: this.update, priority: Scheduler.priority.render});
        };

        Renderer.prototype.uninitialize = function ()
        {
            this.clearEvents();
            InputHandler.off('drag', this);
            InputHandler.unregisterClickEvent('canvas');
            window.removeEventListener('resize', this.onResize, false);
        };

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
                var soldier;
                for (var i = 0; i < this.renderables.length; i++)
                {
                    var obj = this.renderables[i];
                    if (obj instanceof RenderableSoldier && obj.isPointInside(this.camera, e.pageX, e.pageY))
                    {
                        soldier = obj.unit;
                        break;
                    }
                }

                var position = this.camera.screenToTile(e.pageX + this.camera.viewportRect.x, e.pageY + this.camera.viewportRect.y);
                this.renderableMap.onClick(e, position, soldier);
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
            this.renderableMap.render(this.context, this.camera);

            // Pathing needs to be drawn after the map and before the objects
            for (var i = 0; i < this.renderablePaths.length; i++)
                this.renderablePaths[i].render(this.context, this.camera);

            // Make sure the objects are drawn in the right order
            this.renderables.sort(function (obj1, obj2)
            {
                if (obj1.isDead !== obj2.isDead)
                    return obj1.isDead ? -1 : 1;

                if (obj1.getTileX() !== obj2.getTileX())
                    return obj1.getTileX() - obj2.getTileX();

                if (obj1.getTileY() !== obj2.getTileY())
                    return obj1.getTileY() - obj2.getTileY();

                return 0;
            });

            for (i = 0; i < this.renderables.length; i++)
                this.renderables[i].render(this.context, deltaTime, this.camera);
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

        return new Renderer();
    });
