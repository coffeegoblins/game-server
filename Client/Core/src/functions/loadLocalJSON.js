define(['text!Core/content/tracks.json', 'text!Core/content/weapons.json', 'text!Core/content/level1.json', 'text!Core/content/level2.json'],
    function (Sounds, Weapons, Level1, Level2)
    {
        'use strict';
        return function (fileName, onComplete)
        {
            switch (fileName)
            {
                case "sounds":
                    onComplete(JSON.parse(Sounds));
                    break;

                case "level1":
                    onComplete(JSON.parse(Level1));
                    break;

                case "level2":
                    onComplete(JSON.parse(Level2));
                    break;

                case "weapons":
                    onComplete(JSON.parse(Weapons));
                    break;
            }
        };
    });
