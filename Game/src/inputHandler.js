define(function ()
{
    'use strict';

    var registeredEvents = {};

    function onClick(e)
    {
        if (e.which === 1)
            sendInput(e);
    }

    function onTouch(e)
    {
        if (e.changedTouches)
        {
            for (var i = 0; i < e.changedTouches.length; i++)
                sendInput(e.changedTouches[i]);
        }

        e.preventDefault();
    }

    function sendInput(e)
    {
        var registeredEvent = registeredEvents[e.target.id];
        if (registeredEvent)
        {
            var context = registeredEvent.context || e.target;
            registeredEvent.method.call(context, e, e.pageX, e.pageY);
        }
    }

    // Hook into input events
    window.addEventListener('click', onClick, false);
    if (('ontouchstart' in window) || ('onmsgesturechange' in window))
    {
        window.addEventListener('touchstart', onTouch);
        window.addEventListener('MSPointerDown', onTouch);
        document.body.msTouchAction = 'none';
    }


    function InputHandler() { }

    InputHandler.registerEvent = function (id, method, context)
    {
        registeredEvents[id] = {context: context, method: method};
    };

    InputHandler.unregisterEvent = function (id)
    {
        registeredEvents[id] = undefined;
    };

    return InputHandler;
});
