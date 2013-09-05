define(['renderer'], function (Renderer)
{
    'use strict';

    /**
     * @constructor
     */
    function TurnManager()
    {
        this.unitList = [];
    }

    TurnManager.prototype.endTurn = function ()
    {
        // Remove the soldier from the front
        var currentUnit = this.unitList.shift();

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

        currentUnit = this.unitList[0];

        Renderer.camera.moveToUnit(currentUnit);
        Renderer.clearRenderablePath();
    };

    return new TurnManager();
});