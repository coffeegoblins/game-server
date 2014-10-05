module.exports = {
    combatLockCost: 10,
    directions: [
        [6, 7, 0],
        [5, 0, 1],
        [4, 3, 2]
    ],

    unitData:
    {
        "archer":
        {
            "moveCost": 12,
            "maxAP": 100,
            "attacks": [
                {
                    "name": "shortBow",
                    "cost": 20,
                    "range": 10,
                    "minRange": 1.9,
                    "isObstructable": true,
                    "displayName": "Attack",
                    "track": "bow1",
                    "damage":
                    {
                        "archer": 30,
                        "rogue": 30,
                        "shield": 20,
                        "warrior": 25
                    },
                    "accuracy":
                    {
                        "archer": 0.75,
                        "rogue": 0.5,
                        "shield": 0.2,
                        "warrior": 0.9
                    }
                },
                {
                    "name": "overheadAttack",
                    "cost": 35,
                    "range": 8,
                    "minRange": 3.9,
                    "displayName": "Overhead Attack",
                    "track": "bow1",
                    "damage":
                    {
                        "archer": 25,
                        "rogue": 25,
                        "shield": 15,
                        "warrior": 20
                    },
                    "accuracy":
                    {
                        "archer": 0.25,
                        "rogue": 0.2,
                        "shield": 0.1,
                        "warrior": 0.4
                    }
                },
                {
                    "name": "meleeAttack",
                    "cost": 10,
                    "damage": 5,
                    "accuracy": 0.9,
                    "displayName": "Melee Attack"
                }
            ]
        },

        "rogue":
        {
            "moveCost": 10,
            "maxAP": 100,
            "attacks": [
                {
                    "name": "strike",
                    "cost": 30,
                    "damage": 25,
                    "accuracy": 0.9,
                    "displayName": "Strike",
                    "track": "dualStrike"
                },
                {
                    "name": "throwDagger",
                    "cost": 40,
                    "range": 2.9,
                    "damage": 20,
                    "accuracy": 0.9,
                    "isObstructable": true,
                    "displayName": "Dagger throw"
                },
                {
                    "name": "vitalStrike",
                    "cost": 30,
                    "damage": 5,
                    "sideDamage": 5,
                    "backDamage": 10,
                    "accuracy": 0.9,
                    "displayName": "Vital strike"
                }
            ]
        },

        "shield":
        {
            "moveCost": 15,
            "maxAP": 100,
            "attacks": [
                {
                    "name": "strike",
                    "cost": 30,
                    "damage": 30,
                    "accuracy": 0.9,
                    "displayName": "Strike",
                    "track": "strike"
                },
                {
                    "name": "shieldBash",
                    "cost": 30,
                    "damage": 10,
                    "accuracy": 0.9,
                    "breakCombatLock": true,
                    "displayName": "Shield Bash",
                    "track": "shieldBash1"
                },
                {
                    "name": "defend",
                    "cost": 30,
                    "range": 1.5,
                    "displayName": "Defend"
                }
            ]
        },

        "warrior":
        {
            "moveCost": 12,
            "maxAP": 100,
            "attacks": [
                {
                    "name": "strike",
                    "cost": 30,
                    "damage": 30,
                    "accuracy": 0.9,
                    "displayName": "Strike",
                    "track": "twoHandedStrike"
                },
                {
                    "name": "sweep",
                    "cost": 40,
                    "range": 1.5,
                    "damage": 30,
                    "accuracy": 0.9,
                    "displayName": "Sweep",
                    "track": "sweep",
                    "useCrossNodes": true
                },
                {
                    "name": "overhead",
                    "cost": 50,
                    "displayName": "Overhead strike",
                    "damage": 60,
                    "accuracy":
                    {
                        "archer": 0.4,
                        "rogue": 0.3,
                        "shield": 0.8,
                        "warrior": 0.4
                    }
                }
            ]
        }
    },

    breakCombatLock: function (unit)
    {
        if (unit.target && unit.target.target === unit)
        {
            unit.target.target = null;
            unit.target = null;
        }
    },

    applyCombatLock: function (sourceUnit, targetUnit)
    {
        sourceUnit.target = targetUnit;
        this.setDirection(sourceUnit, targetUnit);

        // Only apply lock if target has no target (to allow attacks from behind)
        if (!targetUnit.target)
        {
            targetUnit.target = sourceUnit;
            this.setDirection(targetUnit, sourceUnit);
        }
    },

    getAttacks: function (unit)
    {
        var attacks = [];
        var attackDefinitions = this.unitData[unit.type].attacks;
        for (var i = 0; i < attackDefinitions.length; i++)
        {
            var attack = {
                range: 1
            };
            var attackDefinition = attackDefinitions[i];

            for (var property in attackDefinition)
            {
                attack[property] = attackDefinition[property];
            }

            attack.isDisabled = (attack.cost > unit.ap);
            attacks.push(attack);
        }

        return attacks;
    },

    setDirection: function (unit, target)
    {
        var deltaX = target.x - unit.x;
        var deltaY = target.y - unit.y;

        if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1)
        {
            // Normalize the direction
            var length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            deltaX = Math.round(deltaX / length);
            deltaY = Math.round(deltaY / length);
        }

        unit.direction.x = deltaX;
        unit.direction.y = deltaY;

        //this.direction = this.directions[y + 1][x + 1];
    },

    getMoveCost: function (unit, distance)
    {
        var cost = distance * this.unitData[unit.type].moveCost;
        if (unit.target)
        {
            cost += this.combatLockCost;
        }

        return cost;
    }
};
