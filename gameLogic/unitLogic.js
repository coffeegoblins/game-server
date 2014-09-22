module.exports = {
    combatLockCost: 10,

    unitData:
    {
        "archer":
        {
            "moveCost": 12,
            "maxAP": 100,
            "attacks": [
                {
                    "name": "rangedAttack",
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
                attack[property] = attackDefinition[property];

            attack.isDisabled = (attack.cost > unit.ap);
            attacks.push(attack);
        }

        return attacks;
    },

    getAttackCost: function (unit, attack, targetTile)
    {
        var cost = attack.cost;
        if (unit.target && targetTile && unit.target !== targetTile.unit)
            cost += this.combatLockCost;

        return cost;
    },

    getMoveCost: function (unit, distance)
    {
        var cost = distance * this.unitData[unit.type].moveCost;
        if (unit.target)
            cost += this.combatLockCost;

        return cost;
    },

    endTurn: function (units)
    {
        // Remove the soldier from the front
        var currentUnit = units.shift();

        // Pay the end turn penalty
        currentUnit.ap *= 0.75;
        // TODO this.endTurnPercentageCost;

        var nextUnit = units[0];
        var apIncrement = nextUnit.maxAP - nextUnit.ap;

        // Ensure the next in queue is ready to go
        nextUnit.ap = nextUnit.maxAP;

        // Increment the same amount for all other units
        for (var i = 1; i < units.length; ++i)
        {
            var unit = units[i];
            var missingAP = unit.maxAP - unit.ap;

            // Min() with missing AP to ensure we never go over max AP
            unit.ap += Math.min(apIncrement, missingAP);
        }

        // Place in queue at appropriate spot
        for (var placementIndex = units.length - 1; placementIndex >= 0; --placementIndex)
        {
            var comparisonUnit = units[placementIndex];
            var currentUnitTurnsToMove = currentUnit.maxAP - currentUnit.ap;
            var comparisonUnitTurnsToMove = comparisonUnit.maxAP - comparisonUnit.ap;

            if (currentUnitTurnsToMove >= comparisonUnitTurnsToMove)
            {
                units.splice(placementIndex + 1, 0, currentUnit);
                break;
            }
        }

        // Update turn numbers
        for (i = 0; i < units.length; i++)
        {
            units[i].turnNumber = i + 1;
        }
    }
};
