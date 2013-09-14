define([], function ()
{
    'use strict';
    function RenderableProgressBar(element)
    {
        this.progress = 100;
        this.maxProgress = 100;
        this.timeElapsed = 0;

        this.element = element;
        this.foregroundElement = element.querySelector('.innerBar');
    }

    RenderableProgressBar.prototype.setProgress = function (progress)
    {
        this.progress = progress;
        this.foregroundElement.style.width = this.progress / this.maxProgress * 100 + "%";
    };

    RenderableProgressBar.prototype.setMaxProgress = function (maxProgress)
    {
        this.maxProgress = maxProgress;
        this.foregroundElement.style.width = this.progress / this.maxProgress * 100 + "%";
    };

    return RenderableProgressBar;
});
