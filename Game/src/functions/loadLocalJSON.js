define(['text!Game/content/weapons.json', 'text!Game/content/level1.json'],
    function (Sounds, Weapons, Level1)
    {
        'use strict';
        return function (fileName, onComplete)
        {
            switch (fileName)
            {
                case "level1":
                    onComplete(JSON.parse(Level1));
                    break;

                case "weapons":
                    onComplete(JSON.parse(Weapons));
                    break;
            }
        };
    });