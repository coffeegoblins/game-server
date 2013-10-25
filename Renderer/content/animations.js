'use strict';

window.soldierAnimations = {
    "archer": {
        "spriteSheet": "archerSheetLong",
        "tileHeight": 64,
        "tileWidth": 64,

        "animations": {
            "idle": {
                "start": 16,
                "end": 47,
                "speed": 0.075,
                "frames": {
                    "16": 5,
                    "33": 1.5,
                    "42": 2
                }
            },
            "run": {
                "start": 0,
                "end": 15,
                "speed": 0.03
            },
            "attack": {
                "start": 48,
                "end": 79,
                "speed": 0.05
            },
            "death": {
                "start": 80,
                "end": 111,
                "speed": 0.05,
                "frames": {
                    "111": Infinity
                }
            }
        }
    }
};