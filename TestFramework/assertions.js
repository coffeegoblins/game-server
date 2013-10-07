define(function ()
{
    'use strict';

    var currentWatches = [];
    var messageFormatPlaceholders = ['{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}', '{9}'];


    function assert(testMethod, messageFormat, parameters, minParameterCount)
    {
        if (parameters.length > minParameterCount)
        { // If a message was given, add it to the format
            messageFormat = '{0}\n' + messageFormat;
        }
        else
        { // No message, so pad a value to get the other parameters in the right place
            Array.prototype.unshift.call(parameters, null);
        }

        if (!testMethod.call(null, parameters))
            throw new Error(window.formatMessage(messageFormat, parameters));
    }

    function getWatch(source, method)
    {
        for (var i = 0; i < currentWatches.length; i++)
        {
            var watch = currentWatches[i];
            if (watch.source === source && watch.method === method)
                return watch;
        }
    }

    function onCallTo(source, method, parameters)
    {
        var watch = getWatch(source, method);
        if (watch)
            watch.executions.push(parameters);
    }


    window.assertEquals = function ()
    {
        assert(function (parameters)
        {
            return parameters[1] === parameters[2];
        }, 'Expected {1} to equal {2}.', arguments, 2);
    };

    window.assertFail = function ()
    {
        throw new Error((arguments.length) ? arguments[0] : 'Failure');
    };

    window.assertFalsy = function ()
    {
        assert(function (parameters)
        {
            return !parameters[1];
        }, 'Expected {1} to be falsy.', arguments, 1);
    };

    window.assertTruthy = function ()
    {
        assert(function (parameters)
        {
            return parameters[1];
        }, 'Expected {1} to be truthy.', arguments, 1);
    };

    window.assertWasCalled = function ()
    {
        assert(function (parameters)
        {
            var watch = getWatch(parameters[1], parameters[2]);
            return watch && watch.executions.length;
        }, 'Expected {2} to have been called', arguments, 2);
    };

    window.formatMessage = function (formatString, parameters)
    {
        for (var i = 0; i < parameters.length; i++)
            formatString = formatString.replace(messageFormatPlaceholders[i], parameters[i]);

        return formatString;
    };

    window.watchMethod = function (source, method)
    {
        var originalMethod = source[method];
        source[method] = function ()
        {
            onCallTo(source, method, arguments);
            originalMethod.call(this, arguments);
        };

        currentWatches.push({source: source, method: method, executions: []});
    };

    return {
        clearWatches: function ()
        {
            currentWatches.length = 0;
        }
    };
});