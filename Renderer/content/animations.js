'use strict';

window.soldierAnimations = {
    "archer": {
        "spriteSheet": "archerSheet",
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
                "speed": 0.02,
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

    "swordAndShield": {
        "spriteSheet": "swordAndShieldSheet",
        "tileHeight": 64,
        "tileWidth": 64,

        "animations": {
            "idle": {
                "start": 16,
                "end": 47,
                "speed": 0.1,
                "isLooping": true,
                "frames": {
                    "16": 0,
                    "33": 1.5
                }
            },
            "run": {
                "start": 0,
                "end": 15,
                "speed": 0.02,
                "isLooping": true
            },
            "attack": {
                "start": 48,
                "end": 79,
                "speed": 0.075
            },
            "death": {
                "start": 80,
                "end": 111,
                "speed": 0.075
            }
        }
    },

    "twoHanded": {
        "spriteSheet": "archerSheet",
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

    "dualWield": {
        "spriteSheet": "dualWieldSheet",
        "tileHeight": 64,
        "tileWidth": 64,

        "animations": {
            "idle": {
                "start": 16,
                "end": 47,
                "speed": 0.05,
                "isLooping": true,
                "frames": {
                    "16": 5,
                    "43": 1.5
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
                "speed": 0.03,
                "frames": {
                    "74": 0.5
                }
            },
            "death": {
                "start": 80,
                "end": 111,
                "speed": 0.075
            }
        }
    }
};