define(['text!Game/content/weapons.json', 'text!Game/content/level1.json'],
function (Weapons, Level1)
{
    'use strict';

    return function (fileName, onComplete)
    {
        if (fileName === 'level1')
            onComplete(JSON.parse(Level1));

        switch (fileName)
        {
            case "level1":
                onComplete(JSON.parse(Level1));
                break;
                
            case "weapons":
                onComplete(JSON.parse(Weapons));

            default:
                break;
        }
    };
});