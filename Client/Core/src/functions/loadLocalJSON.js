define(['text!core/content/level1.json', 'text!core/content/level2.json'],
    function (Sounds, Weapons, Level1, Level2)
    {
        'use strict';
        return function (fileName, onComplete)
        {
            switch (fileName)
            {
                case "level1":
                    onComplete(JSON.parse(Level1));
                    break;

                case "level2":
                    onComplete(JSON.parse(Level2));
                    break;
            }
        };
    });
