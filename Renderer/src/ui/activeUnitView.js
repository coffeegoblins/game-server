define(['text!Renderer/content/activeUnitView.html', 'Renderer/src/ui/renderableProgressBar', 'Renderer/src/effects/transitionEffect'],
    function (Template, RenderableProgressBar, TransitionEffect)
    {
        'use strict';

        function ActiveUnitView()
        {
            this.element = document.createElement('div');
            this.element.id = "activeUnitView";
            this.element.innerHTML = Template;
            this.element.style.opacity = 0;

            this.previewImage = this.element.querySelector('.unit-preview');
            this.hpBar = new RenderableProgressBar(this.element.querySelector('#activeUnitHP'));
            this.apBar = new RenderableProgressBar(this.element.querySelector('#activeUnitAP'));

            document.body.appendChild(this.element);
        }

        ActiveUnitView.prototype.onBeginTurn = function (activeUnit)
        {
            this.hpBar.transitionProgress('hpBar', activeUnit.hp, activeUnit.maxHP, 1);
            this.apBar.transitionProgress('apBar', activeUnit.ap, activeUnit.maxAP, 1);
            this.element.className = 'team-' + activeUnit.player.color;
            this.previewImage.className = 'unit-preview unit-type-' + activeUnit.weapon.type;

            TransitionEffect.transitionFloat('activeUnitViewOpacity', this.element.style, 'opacity', null, 1, 0.5, this, function ()
            {
                this.element.style.opacity = 1;
            });
        };

        ActiveUnitView.prototype.onEndTurn = function ()
        {
            this.apBar.stopBlink();

            TransitionEffect.transitionFloat('activeUnitViewOpacity', this.element.style, 'opacity', null, 0, 0.5, this, function ()
            {
                this.element.style.opacity = 0;
            });
        };

        ActiveUnitView.prototype.previewAP = function (ap)
        {
            if (ap === 0)
            {
                this.apBar.stopBlink();
            }
            else
            {
                this.apBar.blinkPortion(ap);
            }
        };

        ActiveUnitView.prototype.setAP = function (ap, maxAP)
        {
            this.apBar.setProgress('apBar', ap, maxAP);
        };

        return ActiveUnitView;
    });