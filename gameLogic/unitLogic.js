module.exports = {
    combatLockCost: 10,

    soldierData: {
        "archer": {
            "moveCost": 12,
            "attacks": [
                {
                    "name": "rangedAttack",
                    "cost": 20,
                    "range": 10,
                    "minRange": 1.9,
                    "isObstructable": true,
                    "displayName": "Attack",
                    "track": "bow1",
                    "damage": {
                        "archer": 30,
                        "rogue": 30,
                        "shield": 20,
                        "warrior": 25
                    },
                    "accuracy": {
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
                    "damage": {
                        "archer": 25,
                        "rogue": 25,
                        "shield": 15,
                        "warrior": 20
                    },
                    "accuracy": {
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

        "rogue": {
            "moveCost": 10,
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

        "shield": {
            "moveCost": 15,
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

        "warrior": {
            "moveCost": 12,
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
                    "accuracy": {
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
        var attackDefinitions = this.soldierData[unit.type].attacks;
        for (var i = 0; i < attackDefinitions.length; i++)
        {
            var attack = {range: 1};
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
        var cost = distance * this.soldierData[unit.type].moveCost;
        if (unit.target)
            cost += this.combatLockCost;

        return cost;
    }
};
