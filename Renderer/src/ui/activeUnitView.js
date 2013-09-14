define(['renderer', 'text!Renderer/content/activeUnitView.html', 'Renderer/src/ui/renderableProgressBar', 'Game/src/scheduler', 'Renderer/src/effects/transitionEffect', 'text!Renderer/content/activeUnitView.html'],
    function (Renderer, Template, RenderableProgressBar, Scheduler, TransitionEffect)
    {
        'use strict';
        function ActiveUnitView()
        {
            this.element = document.createElement('div');
            this.element.id = "activeUnitView";
            this.element.innerHTML = Template;

            this.previewImage = this.element.querySelector('img');
            this.hpBar = new RenderableProgressBar(this.element.querySelector('#activeUnitHP'));
            this.apBar = new RenderableProgressBar(this.element.querySelector('#activeUnitAP'));

            document.body.appendChild(this.element);
        }

        ActiveUnitView.prototype.show = function (unit, seconds, context, callback)
        {
            // TODO Find a better way to get the active unit preview image
            for (var i = 0; i < Renderer.renderables.length; ++i)
            {
                if (unit === Renderer.renderables[i].unit)
                {
                    this.previewImage.src = Renderer.renderables[i].previewImage;
                    break;
                }
            }

            this.hpBar.setProgress(unit.hp);
            this.hpBar.setMaxProgress(unit.maxHP);
            this.apBar.setProgress(unit.ap);
            this.apBar.setMaxProgress(unit.maxAP);

            TransitionEffect.transitionFloat(this.element, "opacity", null, 1, seconds, context, callback);
        };

        ActiveUnitView.prototype.hide = function (seconds, context, callback)
        {
            TransitionEffect.transitionFloat(this.element, "opacity", null, 0, seconds, context, callback);
        };

        return ActiveUnitView;
    });
