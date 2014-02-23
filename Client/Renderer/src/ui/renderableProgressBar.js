define(function ()
{
    'use strict';
    function RenderableProgressBar(element)
    {
        this.element = element;
        this.foregroundElement = element.querySelector('.innerBar');
        this.previewElement = element.querySelector('.innerBarPreview');
        this.foregroundElement.style.width = '100%';
    }

    RenderableProgressBar.prototype.setBlink = function (portion)
    {
        if (portion)
        {
            this.previewElement.style.width = this.foregroundElement.style.width;
            this.foregroundElement.style.width = (this.progress - portion) / this.maxProgress * 100 + '%';
            this.previewElement.className += ' blink';
        }
        else
        {
            this.previewElement.style.width = '0%';
            this.foregroundElement.style.width = this.progress / this.maxProgress * 100 + '%';
            this.previewElement.className = this.previewElement.className.replace('blink', '');
        }
    };

    RenderableProgressBar.prototype.setProgress = function (progress, maxProgress)
    {
        this.progress = progress;
        this.maxProgress = maxProgress;
        this.foregroundElement.style.width = (progress / maxProgress * 100) + '%';
    };

    return RenderableProgressBar;
});