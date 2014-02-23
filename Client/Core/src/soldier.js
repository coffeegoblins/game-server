define(['./eventManager', 'Renderer/src/effects/transitionEffect', './utility'], function (Events, TransitionEffect, Utility)
{
    'use strict';

    var defaults = {
        hp: 100,
        maxHP: 100,
        ap: 42,
        maxAP: 42,
        maxMoveableHeight: 2,
        canClimbObjects: true,
        direction: 0,
        state: 'idle'
    };

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
            this.trigger('death', this);
        }
    };

    Soldier.prototype.isAlive = function ()
    {
        return this.hp > 0;
    };

    Soldier.prototype.setDirection = function (x, y)
    {
        var newDirection = -Math.atan2(x, y);
        var directionDelta = newDirection - this.direction;

        if (Math.abs(directionDelta) > Math.PI)
        {
            if (this.direction < 0)
                this.direction += Math.PI * 2;
            else
                this.direction -= Math.PI * 2;
        }

        TransitionEffect.transitionFloat({
            id: this.name + ' turn',
            source: this,
            property: 'direction',
            targetValue: newDirection,
            duration: 0.1
        });
    };

    Soldier.prototype.setState = function (state)
    {
        this.state = state;
        this.trigger('stateChange');
    };

    Events.register(Soldier.prototype);
    return Soldier;
});
