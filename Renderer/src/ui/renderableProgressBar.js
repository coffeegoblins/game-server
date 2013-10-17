define(['Renderer/src/effects/blinkEffect', 'Renderer/src/effects/transitionEffect'], function (BlinkEffect, TransitionEffect)
{
    'use strict';
    function RenderableProgressBar(element)
    {
        this.element = element;
        this.foregroundElement = element.querySelector('.innerBar');
        this.foregroundElement.style.width = "100%";

        this.previewElement = element.querySelector('.innerBarPreview');
    }

    RenderableProgressBar.prototype.blinkPortion = function (portion)
    {
        this.previewElement.style.width = this.foregroundElement.style.width;
        this.foregroundElement.style.width = (this.progress - portion) / this.maxProgress * 100 + "%";
        BlinkEffect.blink(this.previewElement, 1);
    };

    RenderableProgressBar.prototype.setProgress = function (id, progress, maxProgress)
    {
        this.progress = progress;
        this.maxProgress= maxProgress;

        var progressPercentage = progress / maxProgress * 100;
        this.foregroundElement.style.width = progressPercentage + "%";
    };

    RenderableProgressBar.prototype.transitionProgress = function (id, progress, maxProgress, seconds)
    {
        this.progress = progress;
        this.maxProgress= maxProgress;

        var progressPercentage = progress / maxProgress * 100;

        TransitionEffect.transitionFloat(id, this.foregroundElement.style, 'width', "%", progressPercentage, seconds, this, function(){
            this.foregroundElement.style.width = progressPercentage + "%";
        });
    };

    RenderableProgressBar.prototype.stopBlink = function ()
    {
        this.foregroundElement.style.width = this.progress / this.maxProgress * 100 + "%";
        this.previewElement.style.width = 0 + "%";
        BlinkEffect.stopBlink(this.previewElement);
    };

    return RenderableProgressBar;
});
