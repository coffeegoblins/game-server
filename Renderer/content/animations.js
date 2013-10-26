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
                "isLooping": true,
                "frames": {
                    "16": 5,
                    "33": 1.5,
                    "42": 2
                }
            },
            "run": {
                "start": 0,
                "end": 15,
                "speed": 0.03,
                "isLooping": true
            },
            "attack": {
                "start": 48,
                "end": 79,
                "speed": 0.05
            },
            "death": {
                "start": 80,
                "end": 111,
                "speed": 0.05
            }
        }
    },

    "melee": {
        "spriteSheet": "archerSheet",
        "tileHeight": 64,
        "tileWidth": 64,

        "animations": {
            "idle": {
                "start": 16,
                "end": 31,
                "speed": 0.1,
                "isLooping": true,
                "frames": {
                    "16": 5,
                    "24": 1.5,
                    "28": 2
                }
            },
            "run": {
                "start": 0,
                "end": 15,
                "speed": 0.03,
                "isLooping": true
            },
            "attack": {
                "start": 32,
                "end": 47,
                "speed": 0.075
            },
            "death": {
                "start": 48,
                "end": 63,
                "speed": 0.075
            }
        }
    }
};