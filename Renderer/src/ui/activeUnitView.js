define(['renderer', 'text!Renderer/content/activeUnitView.html', 'Renderer/src/ui/renderableProgressBar', 'Game/src/scheduler', 'Renderer/src/effects/transitionEffect', 'text!Renderer/content/activeUnitView.html'],
    function (Renderer, Template, RenderableProgressBar, Scheduler, TransitionEffect)
    {
        'use strict';
        function ActiveUnitView()
        {
            this.element = document.createElement('div');
            this.element.id = "activeUnitView";
            this.element.innerHTML = Template;
            this.element.style.opacity = 0;

            this.previewImage = this.element.querySelector('img');
            this.hpBar = new RenderableProgressBar(this.element.querySelector('#activeUnitHP'));
            this.apBar = new RenderableProgressBar(this.element.querySelector('#activeUnitAP'));

            document.body.appendChild(this.element);
        }

        ActiveUnitView.prototype.onBeginTurn = function(activeUnit)
        {
            // TODO Find a better way to get the active unit preview image
            for (var i = 0; i < Renderer.renderables.length; ++i)
            {
                if (activeUnit === Renderer.renderables[i].unit)
                {
                    this.previewImage.src = Renderer.renderables[i].previewImage;
                    break;
                }
            }

            this.hpBar.setProgress(activeUnit.hp);
            this.hpBar.setMaxProgress(activeUnit.maxHP);
            this.apBar.setProgress(activeUnit.ap);
            this.apBar.setMaxProgress(activeUnit.maxAP);

            TransitionEffect.transitionFloat('activeUnitViewOpacity', this.element.style, 'opacity', null, 1, 0.5, this, function() {
                this.element.style['opacity'] = 1;
            });
        };

        ActiveUnitView.prototype.onEndTurn = function(activeUnit)
        {
            TransitionEffect.transitionFloat('activeUnitViewOpacity', this.element.style, 'opacity', null, 0, 0.5, this, function() {
                this.element.style['opacity'] = 0;
            });
        };

        ActiveUnitView.prototype.previewAP = function(ap)
        {
            this.apBar.blinkPortion(ap);
        };

        ActiveUnitView.prototype.setAP = function(ap)
        {
            this.apBar.setProgress(ap);
        };

        return ActiveUnitView;
    });
