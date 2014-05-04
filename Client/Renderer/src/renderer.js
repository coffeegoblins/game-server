define([
        'Core/src/events',
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
            sortRenderables(this.renderables);

            if (window.output)
            {
                for (i = 0; i < this.renderables.length; i++)
                {
                    var obj = this.renderables[i].object || this.renderables[i].unit;
                    console.log(obj.tileX, obj.tileY, obj);
                }

                window.output = false;
            }

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

        function sortRenderables(items)
        {
            for (var i = 1; i < items.length; i++)
            {
                var obj1 = items[i];
                for (var j = i - 1; j >= 0; j--)
                {
                    // obj1 < obj2
                    var obj2 = items[j];
                    if (obj1.isDead)
                        break;

                    if (!obj2.isDead)
                    {
                        if (obj1.getTileX() > obj2.getTileX())
                            break;

                        if (obj1.getTileY() > obj2.getTileY())
                            break;
                    }

                    items[j + 1] = items[j];
                }

                items[j + 1] = obj1;
            }
        }

        function sortRenderables2(items)
        {
            var len = items.length;
            for (var i = 0; i < len; i++)
            {
                var value = items[i];
                for (var j = i - 1; j > -1 && items[j] > value; j--)
                {
                    //items[j + 1] = items[j];
                }


                items.splice(j + 1, 0, value);
                items.splice(i, 1);
            }
            //
            //            var newArray = [];
            //
            //            var length = items.length;
            //            for (var i = 0; i < length; i++)
            //            {
            //                var value = items[i];
            //                for (var j = newArray.length - 1; j >= 0; j--)
            //                {
            //                    if (value > length[j])
            //                    {
            //                        newArray.splice(j + 1, 0, value);
            //                        break;
            //                    }
            //                }
            //
            //                if (j < 0)
            //                    newArray.unshift(value);
            //            }

            //            this.renderables.sort(function (obj1, obj2)
            //            {
            //                if (obj1.isDead !== obj2.isDead)
            //                    return obj1.isDead ? -1 : 1;
            //
            //                if (obj1.getTileX() !== obj2.getTileX())
            //                    return obj1.getTileX() - obj2.getTileX();
            //
            //                if (obj1.getTileY() !== obj2.getTileY())
            //                    return obj1.getTileY() - obj2.getTileY();
            //
            //                return 0;
            //            });
        }

        return new Renderer();
    });