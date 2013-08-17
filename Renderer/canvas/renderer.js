define(['Game/src/scheduler', 'Renderer/canvas/renderableMap', 'Renderer/canvas/renderableSoldier'],
    function (Scheduler, RenderableMap, RenderableSoldier)
    {
        'use strict';

        function Renderer()
        {
            this.canvas = null;
            this.context = null;

            this.scale = 1; // TODO: It may be better to scale the canvas instead of the drawing in some cases
            this.viewportRect = {x: 0, y: 0, width: 0, height: 0};

            this.renderableMap = null;
            this.renderables = [];
        }

        function handleResize()
        {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;

            this.viewportRect.width = this.canvas.clientWidth;
            this.viewportRect.height = this.canvas.clientHeight;
        }

        function onCanvasClick(e)
        {
            var x = e.clientX - this.canvas.offsetLeft;
            var y = e.clientY - this.canvas.offsetTop;

            var tile = this.renderableMap.gameMap.getTileAtCoordinate(x, y);

            console.log("Clicked! \n\tX: " + x + "\n\t" + "Y: " + y);
            console.log(tile);
        }

        function onCanvasTouch(e)
        {
            if (e.changedTouches)
            {
                for (var i = 0; i < e.changedTouches.length; i++)
                {
                    var x = e.changedTouches[i].pageX - this.canvas.offsetLeft;
                    var y = e.changedTouches[i].pageY - this.canvas.offsetTop;

                    var tile = this.renderableMap.gameMap.getTileAtCoordinate(x, y);

                    console.log("Touched! \n\tX: " + x + "\n\t" + "Y: " + y);
                    console.log(tile);
                }
            }

            e.preventDefault();
        }

        function update(e, deltaTime)
        {
            this.context.clearRect(0, 0, this.viewportRect.width, this.viewportRect.height);

            if (this.renderableMap)
            {
                // TODO: It may be nice to combine this in with the other renderables, but it will have to render the map first
                this.renderableMap.render(this.context, this.scale, this.viewportRect);
            }

            for (var i = 0; i < this.renderables.length; i++)
            {
                this.renderables[i].render(this.context, this.scale, this.viewportRect);
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

            // Hook into input events
            this.canvas.addEventListener('click', onCanvasClick.bind(this), false);
            if (('ontouchstart' in window) || ('onmsgesturechange' in window))
            {
                var boundTouchHandler = onCanvasTouch.bind(this);
                this.canvas.addEventListener('touchstart', boundTouchHandler);
                this.canvas.addEventListener('MSPointerDown', boundTouchHandler);
                document.body.msTouchAction = 'none';
            }
        };

        return new Renderer();
    });