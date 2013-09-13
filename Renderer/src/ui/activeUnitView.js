define(['renderer', 'Renderer/src/ui/renderableProgressBar', 'Renderer/src/ui/ImageView', 'Game/src/scheduler',
        'Renderer/src/effects/transitionEffect'],
function (Renderer, RenderableProgressBar, ImageView, Scheduler, TransitionEffect)
{
    'use strict';
    function ActiveUnitView()
    {
        this.parentDiv = document.createElement('div');
        this.parentDiv.id = "ActiveUnitView";
        this.parentDiv.style.opacity = 1;
        this.parentDiv.style.width = "20%";
        this.parentDiv.style.height = "20%";
        this.parentDiv.style.position = "absolute";
        this.parentDiv.style.left = "1%";
        this.parentDiv.style.top = "1%";

        this.unitPreview = new ImageView(this.parentDiv, "activeUnitPreview", 50, 80, null);
        this.hpBar = new RenderableProgressBar(this.parentDiv, "activeUnitHP", 100, 10, "black", "green");
        this.apBar = new RenderableProgressBar(this.parentDiv, "activeUnitAP", 100, 10, "black", "orange");

        document.body.appendChild(this.parentDiv);
    }

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

        TransitionEffect.transitionFloat(this.parentDiv, "opacity", null, 1, seconds, context, callback);
    };

    ActiveUnitView.prototype.hide = function(seconds, context, callback)
    {
        TransitionEffect.transitionFloat(this.parentDiv, "opacity", null, 0, seconds, context, callback);
    };

    return ActiveUnitView;
});
