define([
        'text!Renderer/content/templates/unitView.html',
        'text!Renderer/content/templates/unitViewMobile.html',
        'Core/src/inputHandler',
        'Renderer/src/ui/renderableProgressBar',
        'renderer',
        'Core/src/utility'
    ],
    function (DesktopTemplate, MobileTemplate, InputHandler, RenderableProgressBar, Renderer, Utility)
    {
        'use strict';
        var maxOpacity = 0.8;

        function UnitView(element)
        {
            this.element = element;
            this.element.innerHTML = Utility.isMobile ? MobileTemplate : DesktopTemplate;

            this.hpBar = new RenderableProgressBar(this.element.querySelector('.hp-bar'));
            this.apBar = new RenderableProgressBar(this.element.querySelector('.ap-bar'));
            this.images = Array.prototype.slice.call(this.element.querySelectorAll('.active-unit-preview'));
            this.nameElement = this.element.querySelector('.unit-name');

            InputHandler.addClickListener(this.element, this.handleClick.bind(this));
        }

        UnitView.prototype.handleClick = function ()
        {
            if (this.element.style.opacity == maxOpacity)
                Renderer.camera.moveToUnit(this.unit, null, 0.5);
        };

        UnitView.prototype.hide = function ()
        {
            this.apBar.previewProgress();
            this.element.style.opacity = 0;
        };

        UnitView.prototype.onUnitDeath = function ()
        {
            setTimeout(function ()
            {
                this.hide();
            }.bind(this), 1000);
        };

        UnitView.prototype.previewAP = function (ap)
        {
            this.apBar.previewProgress(ap);
        };

        UnitView.prototype.show = function (unit)
        {
            if (this.unit)
                this.unit.off('death', this, this.onUnitDeath);

            this.unit = unit;
            this.unit.on('death', this, this.onUnitDeath);
            this.updateValues();

            this.nameElement.innerHTML = unit.name;
            this.element.style.opacity = maxOpacity;

            if (unit.player.isLocal)
            {
                this.element.classList.add('player-team');
                this.element.classList.remove('enemy-team');
            }
            else
            {
                this.element.classList.add('enemy-team');
                this.element.classList.remove('player-team');
            }

            // Swap the two images
            this.images.push(this.images.shift());
            this.images[0].className = 'active-unit-preview unit-type-' + unit.weapon.type;
            this.images[1].classList.add('previous');

            this.images[0].style.opacity = 1;
            this.images[1].style.opacity = 0;
        };

        UnitView.prototype.updateValues = function ()
        {
            if (this.unit)
            {
                this.hpBar.setProgress(this.unit.hp, this.unit.maxHP);
                this.apBar.setProgress(this.unit.ap, this.unit.maxAP);
            }
        };

        return UnitView;
    });