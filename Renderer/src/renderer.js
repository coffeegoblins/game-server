define(['Game/src/inputHandler',
        'Game/src/scheduler',
        'Game/src/turnManager',
        'Game/src/utility',
        'Renderer/src/renderableMap',
        'Renderer/src/renderableLadder',
        'Renderer/src/renderableObject',
        'Renderer/src/renderableSoldier',
        'Renderer/src/camera/camera',
        'Renderer/src/renderablePath',
        'Renderer/src/effects/blinkEffect',
        'Renderer/src/ui/renderableTurnQueue'],
    function (InputHandler, Scheduler, TurnManager, Utility, RenderableMap, RenderableLadder, RenderableObject, RenderableSoldier, Camera, RenderablePath, BlinkEffect, RenderableTurnQueue)
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

            InputHandler.on('click', this, onClick);
            InputHandler.on('drag', this, onDrag);

            TurnManager.on('beginTurn', this, this.onBeginTurn);
            TurnManager.on('endTurn', this, this.onEndTurn);

            window.camera = this.camera;
        }

        function handleResize()
        {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.camera.handleResize(this.canvas.width, this.canvas.height);
            RenderableTurnQueue.handleResize(this.canvas.width, this.canvas.height);
        }

        function onClick(e)
        {
            this.renderableMap.onClick(e, e.pageX + this.camera.viewportRect.x, e.pageY + this.camera.viewportRect.y, this.camera.scale);
        }

        function onDrag(e, deltaX, deltaY)
        {
            this.camera.moveViewport(deltaX, deltaY);
        }

        function update(e, deltaTime)
        {
            this.context.clearRect(0, 0, this.camera.viewportRect.width, this.camera.viewportRect.height);
            if (!this.renderableMap)
                return;

            var map = this.renderableMap;
            map.render(this.context, deltaTime, this.camera.scale, this.camera.viewportRect);

            // Pathing needs to be drawn after the map and before the objects
            for (var i = 0; i < this.renderablePaths.length; i++)
            {
                this.renderablePaths[i].render(this.context, deltaTime, this.camera.scale, this.camera.viewportRect);
            }

            for (i = 0; i < this.renderables.length; i++)
            {
                var renderable = this.renderables[i];
                if (renderable.isVisible(map.visibleTileLeft, map.visibleTileRight, map.visibleTileTop, map.visibleTileBottom))
                {
                    renderable.render(this.context, deltaTime, this.camera.scale, this.camera.viewportRect);
                }
            }
        }

        Renderer.prototype.addRenderableMap = function (renderableMap)
        {
            this.renderableMap = new RenderableMap(renderableMap);
        };

        Renderer.prototype.clearRenderablePaths = function ()
        {
            this.renderablePaths = [];
        };

        Renderer.prototype.clearRenderablePathById = function (id)
        {
            Utility.removeElementByProperty(this.renderablePaths, 'id', id);
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

        Renderer.prototype.onEndTurn = function (activeUnit)
        {
            for (var i = 0; i < this.renderables.length; ++i)
            {
                var renderable = this.renderables[i];
                if (renderable.unit === activeUnit)
                {
                    renderable.isSelected = false;
                }
            }
        };

        Renderer.prototype.onBeginTurn = function (activeUnit)
        {
            for (var i = 0; i < this.renderables.length; ++i)
            {
                var renderable = this.renderables[i];

                if (!(renderable instanceof RenderableSoldier))
                    continue;

                renderable.isSelected = (renderable.unit === activeUnit);
            }
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