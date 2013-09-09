define(['renderer', 'Renderer/src/ui/renderableProgressBar', 'Renderer/src/ui/ImageView', 'Game/src/scheduler'],
function (Renderer, RenderableProgressBar, ImageView, Scheduler)
{
    'use strict';
    function ActiveUnitView()
    {
        this.opacity = 1;
        this.parentDiv = document.createElement('div');
        this.parentDiv.style.width = "20%";
        this.parentDiv.style.height = "20%";
        this.parentDiv.style.position = "absolute";
        this.parentDiv.style.left = "1%";
        this.parentDiv.style.top = "1%";

        this.unitPreview = new ImageView(this.parentDiv, "activeUnitPreview", 50, 80, null);
        this.hpBar = new RenderableProgressBar(this.parentDiv, "activeUnitHP", 100, 10, "black", "orange");
        this.apBar = new RenderableProgressBar(this.parentDiv, "activeUnitAP", 100, 10, "black", "green");

        document.body.appendChild(this.parentDiv);
    }

    ActiveUnitView.prototype.setOpacity = function(opacity)
    {
        this.opacity = opacity;
        this.unitPreview.setOpacity(opacity);
        this.hpBar.setOpacity(opacity);
        this.apBar.setOpacity(opacity);

        this.refresh();
    };

    ActiveUnitView.prototype.refresh = function()
    {
        document.body.removeChild(this.parentDiv);
        document.body.appendChild(this.parentDiv);
    };

    ActiveUnitView.prototype.show = function(unit, seconds, context, callback)
    {
        // TODO Find a better way to get the active unit preview image
        for (var i = 0; i < Renderer.renderables.length; ++i)
        {
            if (unit === Renderer.renderables[i].unit)
            {
                this.unitPreview.img.src = Renderer.renderables[i].previewImage;
                break;
            }
        }

        this.hpBar.setProgress(unit.hp);
        this.hpBar.setMaxProgress(unit.maxHP);
        this.apBar.setProgress(unit.ap);
        this.apBar.setMaxProgress(unit.maxAP);

        this.opacityCallbackContext = context;
        this.opacityCallback = callback;

        this.transitionOpacity(1, seconds, onFadedIn);
    };

    ActiveUnitView.prototype.hide = function(seconds, context, callback)
    {
        this.opacityCallbackContext = context;
        this.opacityCallback = callback;

        this.transitionOpacity(0, seconds, onFadedOut);
    };

    ActiveUnitView.prototype.transitionOpacity = function(targetOpacity, seconds, callback)
    {
        this.deltaOpacity = targetOpacity - this.opacity;
        this.totalOpacityTime = seconds;

        if (this.opacityEvent)
        {
            Scheduler.unscheduleById("activeUnitViewOpacity");
        }

        this.opacityEvent = {
            id: "activeUnitViewOpacity",
            interval:0.001,
            totalTime: seconds,
            method: onOpacityUpdate,
            completedMethod: callback,
            context: this
        };

        Scheduler.schedule(this.opacityEvent);
    };

    function onOpacityUpdate(eventData, deltaTime)
    {
        this.setOpacity(this.opacity + this.deltaOpacity * deltaTime / this.totalOpacityTime);
    }

    function onFadedIn(context, eventData)
    {
        this.setOpacity(1);

        if (this.opacityCallback)
            this.opacityCallback.call(this.opacityCallbackContext);
    }

    function onFadedOut(context, eventData)
    {
        this.setOpacity(0);

        if (this.opacityCallback)
            this.opacityCallback.call(this.opacityCallbackContext);
    }

    return ActiveUnitView;
});
