define([], function ()
{
    'use strict';

    function Camera()
    {
        this.viewportRect = {x: 0, y: 0, width: 0, height: 0};
        this.centerX = 0;
        this.centerY = 0;
    }

    Camera.prototype.handleResize = function(width, height)
    {
        this.centerX = this.viewportRect.x + width / 2;
        this.centerY = this.viewportRect.y + height / 2;
        this.viewportRect.width = width;
        this.viewportRect.height = height;
    }

    Camera.prototype.moveToUnit = function(unit)
    {
        this.moveViewport(unit.x, unit.y, 1);
    }

    Camera.prototype.moveViewport = function(targetX, targetY, seconds)
    {
        console.log("Moving to (" + targetX + "," + targetY + ") in " + seconds + " seconds...");
        console.log("Starting second: " + new Date().getSeconds());

        this.targetX = targetX;
        this.targetY = targetY;
        this.deltaX = this.targetX - this.centerX;
        this.deltaY = this.targetY - this.centerY;
        this.transitionTime = seconds;
        this.timeElapsed = 0;
    }

    Camera.prototype.update = function(e, deltaTime)
    {
        if (this.transitionTime != null)
        {
            this.timeElapsed += deltaTime;
            var partialTime = deltaTime / this.transitionTime;

            this.centerX += this.deltaX * partialTime;
            this.centerY += this.deltaY * partialTime;
            this.viewportRect.x = this.centerX - this.viewportRect.width / 2;
            this.viewportRect.y = this.centerY - this.viewportRect.height / 2;

            if (this.timeElapsed >= this.transitionTime)
            {
                this.transitionTime = null;
                this.centerX = this.targetX;
                this.centerY = this.targetY;
                this.viewportRect.x = this.centerX - this.viewportRect.width / 2;
                this.viewportRect.y = this.centerY - this.viewportRect.height / 2;

                console.log("Destination Reached.");
                console.log("End second: " + new Date().getSeconds());
            }
        }
    }

    return Camera;
});