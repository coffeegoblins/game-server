define(function ()
{
    'use strict';

    /**
     * @constructor
     */
    function TurnManager()
    {
        this.unitList = [];
        this.activeUnit = null;
        this.registeredBeginTurnEvents = [];
        this.registeredEndTurnEvents = [];
    }

    TurnManager.prototype.registerBeginTurnEvent = function (id, method, context)
    {
        this.registeredBeginTurnEvents.push({context: context, method: method});
    };

    TurnManager.prototype.registerEndTurnEvent = function (id, method, context)
    {
        this.registeredEndTurnEvents.push({context: context, method: method});
    };

    TurnManager.prototype.beginTurn = function()
    {
        this.activeUnit = this.unitList[0];

        for (var i = 0; i < this.registeredBeginTurnEvents.length; ++i)
        {
            var registeredEvent = this.registeredBeginTurnEvents[i];
            if (registeredEvent)
            {
                registeredEvent.method.call(registeredEvent.context, this.activeUnit);
            }
        }
    };

    TurnManager.prototype.endTurn = function ()
    {
        // Remove the soldier from the front
        var currentUnit = this.unitList.shift();
        this.activeUnit = null;

        // +1 CurrentAP for all other units
        for (var i = 0; i < this.unitList.length; ++i)
        {
            if (this.unitList[i].ap !== this.unitList[i].maxAP)
            {
                this.unitList[i].ap++;
            }
        }

        // Place in queue at appropriate spot
        for (i = this.unitList.length - 1; i > 0; --i)
        {
            var comparisonUnit = this.unitList[i];

            if (currentUnit.maxAP - currentUnit.ap >= comparisonUnit.maxAP - comparisonUnit.ap ||
                comparisonUnit.ap === comparisonUnit.maxAP)
            {
                this.unitList.splice(i + 1, 0, currentUnit);
                break;
            }
        }

        for ( i = 0; i < this.registeredEndTurnEvents.length; ++i)
        {
            var registeredEvent = this.registeredEndTurnEvents[i];
            if (registeredEvent)
            {
                registeredEvent.method.call(registeredEvent.context, currentUnit);
            }
        }

        this.beginTurn();
    };

    return new TurnManager();
});