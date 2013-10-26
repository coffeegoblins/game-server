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
        attackRange: 20,
        attackPower: 25,
        attackCost: 25,
        direction: 0,
        state: 'idle',
        weapon: 'bow'
    };

    function Soldier(properties)
    {
        Utility.merge(this, defaults, properties);

    }

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

        TransitionEffect.transitionFloat(null, this, 'direction', null, newDirection, 0.2);
    };

    Soldier.prototype.setState = function (state)
    {
        this.state = state;
        this.trigger('stateChange');
    };

    Events.register(Soldier.prototype);
    return Soldier;
});