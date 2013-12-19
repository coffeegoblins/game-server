define(['renderer', 'text!Renderer/content/activeUnitView.html', 'Game/src/ImageCache', 'Renderer/src/ui/renderableProgressBar',
        'Game/src/scheduler', 'Renderer/src/effects/transitionEffect', 'text!Renderer/content/activeUnitView.html'],
    function (Renderer, Template, ImageCache, RenderableProgressBar, Scheduler, TransitionEffect)
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

            ImageCache.loadImage('archerPortrait', 'Renderer/content/archer.png');
            ImageCache.loadImage('swordAndShieldPortrait', 'Renderer/content/soldier.png');
            ImageCache.loadImage('dualWieldPortrait', 'Renderer/content/soldier.png');
            ImageCache.loadImage('twoHandedPortrait', 'Renderer/content/soldier.png');
        }

        ActiveUnitView.prototype.onBeginTurn = function (activeUnit)
        {
            this.previewImage.src = ImageCache.getImage(activeUnit.weapon.type + "Portrait").data.src;

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
