define(function ()
{
    'use strict';

    var handleInput = true;
    var registeredClickEvents = {};
    var registeredDragEvents = {};
    var mouseEvent;
    var activeTouches = {};

    function hasMovedEnough(event1, event2)
    {
        return Math.abs(event1.pageX - event2.pageX) + Math.abs(event1.pageY - event2.pageY) > 10;
    }

    function handleMoveEvent(moveEvent, currentEvent)
    {
        moveEvent.currentEvent = currentEvent;
        if (moveEvent.isDragging)
        {
            sendDrag(moveEvent);
        }
        else if (hasMovedEnough(currentEvent, moveEvent.initialEvent))
        {
            moveEvent.isDragging = true;
        }

        moveEvent.previousX = currentEvent.pageX;
        moveEvent.previousY = currentEvent.pageY;
    }

    function onMouseDown(e)
    {
        if (handleInput && e.which === 1)
        {
            mouseEvent = {initialEvent: e, previousX: e.pageX, previousY: e.pageY};
        }

        e.preventDefault();
    }

    function onMouseMove(e)
    {
        if (mouseEvent)
        {
            handleMoveEvent(mouseEvent, e);
        }
    }

    function onMouseUp()
    {
        if (mouseEvent)
        {
            if (!mouseEvent.isDragging)
            {
                sendClick(mouseEvent.currentEvent || mouseEvent.initialEvent);
            }

            mouseEvent = null;
        }
    }

    function onTouchStart(e)
    {
        if (handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = e.changedTouches[i];
                activeTouches[touch.id] = {initialEvent: touch, previousX: touch.pageX, previousY: touch.pageY};
            }
        }
    }

    function onTouchMove(e)
    {
        if (handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = e.changedTouches[i];
                var activeTouch = activeTouches[touch.id];
                if (activeTouch)
                {
                    handleMoveEvent(activeTouch, touch);
                }
            }
        }

        e.preventDefault();
    }

    function onTouchEnd(e)
    {
        if (handleInput && e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
            {
                var touch = e.changedTouches[i];
                var activeTouch = activeTouches[touch.id];
                if (activeTouch)
                {
                    if (!activeTouch.isDragging)
                    {
                        sendClick(activeTouch.currentEvent || activeTouch.initialEvent);
                    }

                    delete activeTouches[touch.id];
                }
            }
        }
    }

    function onTouchCancel(e)
    {
        if (e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
                delete activeTouches[e.changedTouches.id];
        }
    }

    function onWindowBlur()
    {
        mouseEvent = null;
        activeTouches = {};
    }

    function sendClick(e)
    {
        var registeredEvent = registeredClickEvents[e.target.id];
        if (registeredEvent)
        {
            var context = registeredEvent.context || e.target;
            registeredEvent.method.call(context, e, e.pageX, e.pageY);
        }
    }

    function sendDrag(eventObject)
    {
        var registeredEvent = registeredDragEvents[eventObject.initialEvent.target.id];
        if (registeredEvent)
        {
            var deltaX = eventObject.previousX - eventObject.currentEvent.pageX;
            var deltaY = eventObject.previousY - eventObject.currentEvent.pageY;

            var context = registeredEvent.context || eventObject.initialEvent.target;
            registeredEvent.method.call(context, eventObject.currentEvent, deltaX, deltaY);
        }
    }

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

    function InputHandler() { }

    InputHandler.disableInput = function ()
    {
        handleInput = false;
    };

    InputHandler.enableInput = function ()
    {
        handleInput = true;
    };

    InputHandler.registerClickEvent = function (id, method, context)
    {
        registeredClickEvents[id] = {context: context, method: method};
    };

    InputHandler.registerDragEvent = function (id, method, context)
    {
        registeredDragEvents[id] = {context: context, method: method};
    };

    InputHandler.unregisterClickEvent = function (id)
    {
        registeredClickEvents[id] = undefined;
    };

    InputHandler.unregisterDragEvent = function (id)
    {
        registeredDragEvents[id] = undefined;
    };

    return InputHandler;
});
