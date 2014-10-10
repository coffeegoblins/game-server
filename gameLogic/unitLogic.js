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
            "attacks": ["shortbow", "dagger", "arcshot"]
        },

        "shield":
        {
            "moveCost": 15,
            "maxAP": 100,
            "attacks": ["strike", "shieldbash"]
        },

        "warrior":
        {
            "moveCost": 12,
            "maxAP": 100,
            "attacks": ["strike", "sweep", "overhead"]
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

breakCombatLock: function (sourceUnit, targetUnit)
{
    sourceUnit.target = null;

    if (targetUnit && targetUnit.target === sourceUnit._id)
    {
        targetUnit.target = null;
    }
},

applyCombatLock: function (sourceUnit, targetUnit)
{
    sourceUnit.target = targetUnit._id;
    sourceUnit.direction = this.getDirection(sourceUnit, targetUnit);

    // Only apply lock if target has no target (to allow attacks from behind)
    if (!targetUnit.target)
    {
        targetUnit.target = sourceUnit._id;
        targetUnit.direction = this.getDirection(targetUnit, sourceUnit);
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

getDirection: function (source, target)
{
    var deltaX = target.x - Math.round(source.x);
    var deltaY = target.y - Math.round(source.y);

    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1)
    {
        // Normalize the direction
        var length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        deltaX = Math.round(deltaX / length);
        deltaY = Math.round(deltaY / length);
    }

    return {
        x: deltaX,
        y: deltaY
    };
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
