define(['Game/src/scheduler'], function (Scheduler)
{
    'use strict';
    function RenderableProgressBar(parentDiv, id, width, height, backgroundColor, foregroundColor)
    {
        this.parentDiv = parentDiv;
        this.progress = 100;
        this.maxProgress = 100;
        this.opacity = 1;
        this.timeElapsed = 0;

        this.backgroundDiv = document.createElement('div');
        this.backgroundDiv.id = id;
        this.backgroundDiv.style.width = width + "%";
        this.backgroundDiv.style.height = height + "%";
        this.backgroundDiv.style.backgroundColor = backgroundColor;
        this.backgroundDiv.style.padding = "3px";
        this.backgroundDiv.style.borderRadius = "13px";

        this.foregroundDiv = document.createElement('div');
        this.foregroundDiv.style.backgroundColor = foregroundColor;
        this.foregroundDiv.style.width = "100%";
        this.foregroundDiv.style.height = "100%";
        this.foregroundDiv.style.borderRadius = "10px";

        this.backgroundDiv.appendChild(this.foregroundDiv);

        this.parentDiv.appendChild(this.backgroundDiv);
    }

    RenderableProgressBar.prototype.setProgress = function(progress)
    {
        this.progress = progress;
        this.foregroundDiv.style.width = this.progress / this.maxProgress * 100 + "%";
    };

    RenderableProgressBar.prototype.setMaxProgress = function(maxProgress)
    {
        this.maxProgress = maxProgress;
        this.foregroundDiv.style.width = this.progress / this.maxProgress * 100 + "%";
    };

    RenderableProgressBar.prototype.setOpacity = function(opacity)
    {
        this.opacity = opacity;
        this.backgroundDiv.style.opacity = opacity;
    };

    RenderableProgressBar.prototype.transitionProgress = function(targetProgress, seconds)
    {
        this.targetProgress = targetProgress;
        this.deltaProgress = targetProgress - this.progress;
        this.totalProgressTime = seconds;

        Scheduler.schedule({
            totalTime: seconds,
            method: onProgressBarUpdate,
            completedMethod: onProgressBarUpdateCompleted,
            context: this
        });
    };

    function onProgressBarUpdate(eventData, deltaTime)
    {
        this.setProgress(this.progress + this.deltaProgress * deltaTime / this.totalProgressTime);
    }

    function onProgressBarUpdateCompleted(context, eventData)
    {
        this.setProgress(this.targetProgress);
    }

    return RenderableProgressBar;
});
