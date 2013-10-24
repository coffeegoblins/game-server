define(function ()
{
    'use strict';

    var asyncQueue = [];

    function AsyncFramework() { }

    AsyncFramework.isRunning = function ()
    {
        return asyncQueue.length;
    };

    function delay(method, parameters)
    {
        setTimeout(function () { method.call(null, parameters); }, 0);
    }

    function executeAsyncQueue()
    {
        var currentItem = asyncQueue[0];
        if (currentItem.startTime == null)
            currentItem.startTime = Date.now();

        if (Date.now() - currentItem.startTime > currentItem.timeout)
        {
            if (currentItem.isWait)
            {
                asyncQueue.shift();
            }
            else
            {
                if (!currentItem.message)
                    currentItem.message = 'A timeout occurred after waiting for ' + currentItem.timeout + 'ms';

                asyncQueue.length = 0;
                delay(AsyncFramework.onMethodException, {stack: currentItem.message});
                return;
            }
        }
        else if (!currentItem.isWait)
        {
            try
            {
                if (currentItem.method() !== false)
                    asyncQueue.shift();
            }
            catch (e)
            {
                asyncQueue.length = 0;
                delay(AsyncFramework.onMethodException, e);
                return;
            }
        }

        if (asyncQueue.length)
            setTimeout(executeAsyncQueue, 20);
        else
            delay(AsyncFramework.onMethodComplete);
    }

    window.async = function ()
    {
        var message, timeout;
        if (arguments.length > 2)
        {
            message = arguments[1];
            timeout = arguments[2];
        }
        else if (typeof arguments[1] === 'number')
        {
            timeout = arguments[1];
        }
        else
        {
            message = arguments[1];
        }

        if (timeout == null || typeof timeout !== 'number')
            timeout = 1000;

        if (!asyncQueue.length)
            delay(executeAsyncQueue);

        asyncQueue.push({method: arguments[0], message: message, timeout: timeout});
    };

    window.asyncWait = function (duration)
    {
        if (duration == null || typeof duration !== 'number')
            duration = 1000;

        if (!asyncQueue.length)
            delay(executeAsyncQueue);

        asyncQueue.push({timeout: duration, isWait: true});
    };

    return AsyncFramework;
});