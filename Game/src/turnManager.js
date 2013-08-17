define([], function ()
{
    'use strict';

    /**
     * @constructor
     */
    function TurnManager()
    {
        this.unitList = new Array();
    }

    TurnManager.prototype.endTurn = function()
    {
        // Remove the soldier from the front
        var currentUnit = this.unitList.splice(0, 1)[0];

        // +1 MOV for all other units
        for (var i = 0; i < this.unitList.length; ++i)
        {
            if (this.unitList[i].MOV != this.unitList[i].TotalMOV)
            {
                this.unitList[i].MOV++;
            }
        }

        // Place in queue at appropriate spot
        for (var i = this.unitList.length - 1; i > 0; --i)
        {
            var comparisonUnit = this.unitList[i];

            if (currentUnit.TotalMOV - currentUnit.MOV >= comparisonUnit.TotalMOV - comparisonUnit.MOV ||
                comparisonUnit.MOV == comparisonUnit.TotalMOV)
            {
                this.unitList.splice(i + 1, 0, currentUnit);
                break;
            }
        }
    };

    return new TurnManager;
});