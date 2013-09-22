define(['Renderer/src/effects/blinkEffect'], function (BlinkEffect)
{
    'use strict';
    function RenderableProgressBar(element)
    {
        this.progress = 100;
        this.maxProgress = 100;
        this.timeElapsed = 0;

        this.element = element;
        this.foregroundElement = element.querySelector('.innerBar');
        this.previewElement = element.querySelector('.innerBarPreview');
    }

    RenderableProgressBar.prototype.blinkPortion = function (portion)
    {
        this.foregroundElement.style.width = (this.progress - portion) / this.maxProgress * 100 + "%";
        BlinkEffect.blink(this.previewElement, 1);
    };

    RenderableProgressBar.prototype.setProgress = function (progress)
    {
        this.progress = Math.min(progress, this.maxProgress);

        var progressPercentage = this.progress / this.maxProgress * 100;
        this.foregroundElement.style.width = progressPercentage + "%";
        this.previewElement.style.width = this.foregroundElement.style.width;
    };

    RenderableProgressBar.prototype.setMaxProgress = function (maxProgress)
    {
        this.maxProgress = maxProgress;
        this.setProgress(this.progress);
    };

    RenderableProgressBar.prototype.stopBlink = function ()
    {
        BlinkEffect.stopBlink(this.previewElement);
    };

    return RenderableProgressBar;
});
