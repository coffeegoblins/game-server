define(['./eventManager', './scheduler'], function (EventManager, Scheduler)
{
    'use strict';

    function InputHandler()
    {
        this.InputState = {
            DOWN: 0,
            UP: 1,
            DRAGGING: 2,
            FLICKING: 3
        };

        this.mouseEvent = null;
        this.flickEvent = null;
        this.activeTouches = {};
        this.handleInput = true;
        this.registeredClickEvents = {};
    }

    InputHandler.getInstance = function ()
    {
        return inputHandler;
    };

    InputHandler.disableInput = function ()
    {
        inputHandler.handleInput = false;
    };

    InputHandler.enableInput = function ()
    {
        inputHandler.handleInput = true;
    };

    InputHandler.registerClickEvent = function (id, method, context)
    {
        inputHandler.registeredClickEvents[id] = {context: context, method: method};
    };

    InputHandler.unregisterClickEvent = function (id)
    {
        inputHandler.registeredClickEvents[id] = undefined;
    };

    EventManager.register(InputHandler);

    InputHandler.prototype.handlePressEvent = function (currentEvent)
    {
        Scheduler.unscheduleById('flick');

        var pressEvent = {
            initialEvent: currentEvent,
            currentEvent: currentEvent,
            dragEvents: [],
            state: this.InputState.DOWN
        };

        return pressEvent;
    };

    InputHandler.prototype.handleMoveEvent = function (moveEvent, currentEvent)
    {
        switch (moveEvent.state)
        {
            case this.InputState.DOWN:
                if (this.hasMovedEnough(moveEvent.initialEvent, currentEvent))
                    moveEvent.state = this.InputState.DRAGGING;
                break;

            case this.InputState.DRAGGING:
                var date = new Date();
                currentEvent.currentTime = date.getTime();

                moveEvent.dragEvents.push(currentEvent);

                for (var i = 0; i < moveEvent.dragEvents.length; ++i)
                {
                    var deltaTime = currentEvent.currentTime - moveEvent.dragEvents[i].currentTime;

                    if (deltaTime < 100)
                        break;

                    moveEvent.dragEvents.splice(i, 1);
                    --i;
                }

                this.sendDrag(moveEvent, currentEvent.pageX, currentEvent.pageY, moveEvent.currentEvent.pageX, moveEvent.currentEvent.pageY);

                moveEvent.currentEvent = currentEvent;
                break;
        }
    };

    InputHandler.prototype.handleReleaseEvent = function (releaseEvent)
    {
        switch (releaseEvent.state)
        {
            case this.InputState.DOWN:
                this.sendClick(releaseEvent.currentEvent || releaseEvent.initialEvent);
                break;

            case this.InputState.DRAGGING:
                releaseEvent.state = this.InputState.FLICKING;

                this.flickEvent = releaseEvent;

                var totalVelocityX = 0;
                var totalVelocityY = 0;

                for (var i = 0; i < this.flickEvent.dragEvents.length - 1; ++i)
                {
                    totalVelocityX += this.flickEvent.dragEvents[i].pageX - this.flickEvent.dragEvents[i + 1].pageX;
                    totalVelocityY += this.flickEvent.dragEvents[i].pageY - this.flickEvent.dragEvents[i + 1].pageY;
                }

                this.flickEvent.currentX = this.flickEvent.currentEvent.pageX;
                this.flickEvent.currentY = this.flickEvent.currentEvent.pageY;
                this.flickEvent.velocityX = totalVelocityX / (this.flickEvent.dragEvents.length - 1);
                this.flickEvent.velocityY = totalVelocityY / (this.flickEvent.dragEvents.length - 1);

                if (this.flickEvent.velocityX !== 0 && this.flickEvent.velocityY !== 0)
                {
                    Scheduler.schedule({id: 'flick', method: this.flick, context: this});
                    return;
                }
        }

        releaseEvent.state = this.InputState.UP;
    };

    InputHandler.prototype.flick = function (eventData, deltaTime)
    {
        var dragX = this.flickEvent.currentX + this.flickEvent.velocityX;
        var dragY = this.flickEvent.currentY + this.flickEvent.velocityY;

        this.flickEvent.velocityX *= 0.9;
        this.flickEvent.velocityY *= 0.9;

        if (Math.floor(Math.abs(this.flickEvent.velocityX)) === 0 && Math.floor(Math.abs(this.flickEvent.velocityY)) === 0)
        {
            Scheduler.unscheduleById('flick');
            this.flickEvent = null;
            return;
        }

        this.sendDrag(this.flickEvent, this.flickEvent.currentX, this.flickEvent.currentY, dragX, dragY);

        this.flickEvent.currentX = dragX;
        this.flickEvent.currentY = dragY;
    };

    function onMouseDown(e)
    {
        if (inputHandler.handleInput && e.which === 1)
        {
            inputHandler.mouseEvent = inputHandler.handlePressEvent(e);
        }

        e.preventDefault();
    }

    function onMouseMove(e)
    {
        if (inputHandler.handleInput && inputHandler.mouseEvent)
            inputHandler.handleMoveEvent(inputHandler.mouseEvent, e);
    }

    InputHandler.prototype.hasMovedEnough = function (event1, event2)
    {
        return Math.abs(event1.pageX - event2.pageX) + Math.abs(event1.pageY - event2.pageY) > 10;
    };

    function onMouseUp()
    {
        if (inputHandler.handleInput && inputHandler.mouseEvent)
        {
            inputHandler.handleReleaseEvent(inputHandler.mouseEvent);
        }
    }

    function onTouchStart(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = e.changedTouches[i];
                inputHandler.activeTouches[touch.id] = inputHandler.handlePressEvent(touch);
            }
        }

        e.preventDefault();
    }

    function onTouchMove(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = e.changedTouches[i];
                var activeTouch = inputHandler.activeTouches[touch.id];
                if (activeTouch)
                {
                    inputHandler.handleMoveEvent(activeTouch, touch);
                }
            }
        }

        e.preventDefault();
    }

    function onTouchEnd(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = e.changedTouches[i];
                var activeTouch = inputHandler.activeTouches[touch.id];
                if (activeTouch)
                {
                    inputHandler.handleReleaseEvent(activeTouch);

                    delete inputHandler.activeTouches[touch.id];
                }
            }
        }
    }

    function onTouchCancel(e)
    {
        if (inputHandler.handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
                delete inputHandler.activeTouches[e.changedTouches.id];
        }
    };

    function onWindowBlur()
    {
        inputHandler.activeTouches = {};
    }

    InputHandler.prototype.sendClick = function (e)
    {
        var registeredEvent = this.registeredClickEvents[e.target.id];
        if (registeredEvent)
        {
            var context = registeredEvent.context || e.target;
            registeredEvent.method.call(context, e);
        }
        else
        {
            InputHandler.trigger('click', e);
        }
    };

    InputHandler.prototype.sendDrag = function (event, previousX, previousY, targetX, targetY)
    {
        var deltaX = targetX - previousX;
        var deltaY = targetY - previousY;
        InputHandler.trigger('drag', event, deltaX, deltaY);
    };

    // Block anything we don't want to happen
    var preventDefault = function (e) {e.preventDefault();};
    window.addEventListener('contextmenu', preventDefault, false);
    window.addEventListener('MSHoldVisual', preventDefault, false);
    window.addEventListener('selectstart', preventDefault, false);

    // Hook into input events
    window.addEventListener('mousedown', onMouseDown, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('blur', onWindowBlur, false);

    if (('ontouchstart' in window) || ('onmsgesturechange' in window))
    {
        // TODO: I have no idea what's going on with the Microsoft events. Maybe they'll come
        // though the mouse API and just work, or maybe we need to figure these methods out
        // because I'm pretty sure they don't expose the same variables as other touch methods.

        //if (window.navigator.msPointerEnabled)
        //{
        //    window.addEventListener('pointerdown', onTouchMove, false);
        //    window.addEventListener('MSPointerDown', onTouchMove, false);
        //    window.addEventListener('pointermove', onTouchMove, false);
        //    window.addEventListener('MSPointerMove', onTouchMove, false);
        //    window.addEventListener('pointerup', onTouchEnd, false);
        //    window.addEventListener('MSPointerUp', onTouchEnd, false);
        //    window.addEventListener('pointercancel', onTouchCancel, false);
        //    window.addEventListener('MSPointerCancel', onTouchCancel, false);
        //}
        //else
        //{
        window.addEventListener('touchstart', onTouchStart, false);
        window.addEventListener('touchmove', onTouchMove, false);
        window.addEventListener('touchend', onTouchEnd, false);
        window.addEventListener('touchcancel', onTouchCancel, false);
        //}

        document.body.style.msTouchAction = 'none';
        document.body.className += ' touch';
    }

    var inputHandler = new InputHandler();

    return InputHandler;
});