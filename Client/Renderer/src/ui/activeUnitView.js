define(['text!Renderer/content/templates/activeUnitView.html', 'Renderer/src/ui/renderableProgressBar'],
    function (Template, RenderableProgressBar)
    {
        'use strict';

        function ActiveUnitView(element)
        {
            this.element = element;
            this.element.id = "activeUnitView";
            this.element.innerHTML = Template;
            this.element.style.opacity = 0;

            this.previewImage = this.element.querySelector('.active-unit-preview');
            this.hpBar = new RenderableProgressBar(this.element.querySelector('#activeUnitHP'));
            this.apBar = new RenderableProgressBar(this.element.querySelector('#activeUnitAP'));
        }

        ActiveUnitView.prototype.onBeginTurn = function (activeUnit)
        {
            this.hpBar.transitionProgress('hpBar', activeUnit.hp, activeUnit.maxHP, 1);
            this.apBar.transitionProgress('apBar', activeUnit.ap, activeUnit.maxAP, 1);
            this.element.className = 'team-' + activeUnit.color;
            this.previewImage.className = 'active-unit-preview unit-type-' + activeUnit.weapon.type;
            this.element.style.opacity = 1;
        };

        ActiveUnitView.prototype.onEndTurn = function ()
        {
            this.apBar.stopBlink();
            this.element.style.opacity = 0;
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