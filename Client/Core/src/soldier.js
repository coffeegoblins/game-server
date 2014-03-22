define(['./eventManager', './utility'], function (Events, Utility)
{
    'use strict';

    var defaults = {
        hp: 100,
        maxHP: 100,
        ap: 42,
        maxAP: 42,
        maxMoveableHeight: 2,
        canClimbObjects: true,
        direction: 1,
        state: 'idle'
    };

    var directions = [
        [6, 7, 0],
        [5, 0, 1],
        [4, 3, 2]
    ];

    function Soldier(properties)
    {
        Utility.merge(this, defaults, properties);
    }

    Soldier.prototype.damage = function (amount)
    {
        this.hp -= amount;
        if (this.hp <= 0)
        {
            this.setState('death');
            this.isTargeted = false;
            this.trigger('death', this);
        }
    };

    Soldier.prototype.isAlive = function ()
    {
        return this.hp > 0;
    };

    Soldier.prototype.setDirection = function (x, y)
    {
        var previousDirection = this.direction;
        this.direction = directions[y + 1][x + 1];

        if (this.direction !== previousDirection)
            this.trigger('directionChange');
    };

    Soldier.prototype.setState = function (state)
    {
        if (this.state !== state)
        {
            this.state = state;
            this.trigger('stateChange');
        }
    };

    Events.register(Soldier.prototype);
    return Soldier;
});
