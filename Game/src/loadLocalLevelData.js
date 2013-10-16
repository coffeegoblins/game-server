define(['text!Game/content/level1.json'], function (Level1)
{
    'use strict';

    return function (fileName, onComplete)
    {
        if (fileName === 'level1')
            onComplete(JSON.parse(Level1));
    };
});