define(function ()
{
    'use strict';

    return  function (fileName, onComplete)
    {
        var request = new XMLHttpRequest();
        request.overrideMimeType('application/json');
        request.open('GET', 'Game/content/' + fileName + '.json');

        request.onreadystatechange = function ()
        {
            if (request.readyState === 4 && request.status === 200)
                onComplete(JSON.parse(request.responseText));
        };

        request.send();
    };
});