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

            this.previewImage = this.element.querySelector('.active-unit-preview');
            this.hpBar = new RenderableProgressBar(this.element.querySelector('#activeUnitHP'));
            this.apBar = new RenderableProgressBar(this.element.querySelector('#activeUnitAP'));

            document.body.appendChild(this.element);
        }

        ActiveUnitView.prototype.onBeginTurn = function (activeUnit)
        {
            this.hpBar.transitionProgress('hpBar', activeUnit.hp, activeUnit.maxHP, 1);
            this.apBar.transitionProgress('apBar', activeUnit.ap, activeUnit.maxAP, 1);
            this.element.className = 'team-' + activeUnit.color;
            this.previewImage.className = 'active-unit-preview unit-type-' + activeUnit.weapon.type;

            TransitionEffect.transitionFloat({
                id: 'activeUnitViewOpacity',
                source: this.element.style,
                property: 'opacity',
                targetValue: 1,
                duration: 0.5,
                context: this,
                completedMethod: function ()
                {
                    this.element.style.opacity = 1;
                }
            });
        };

        ActiveUnitView.prototype.onEndTurn = function ()
        {
            this.apBar.stopBlink();

            TransitionEffect.transitionFloat({
                id: 'activeUnitViewOpacity',
                source: this.element.style,
                property: 'opacity',
                targetValue: 0,
                duration: 0.5,
                context: this,
                completedMethod: function ()
                {
                    this.element.style.opacity = 0;
                }
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