define(['text!Renderer/content/templates/activeUnitView.html', 'Renderer/src/ui/renderableProgressBar'], function (Template, RenderableProgressBar)
{
    'use strict';

    function ActiveUnitView(element)
    {
        this.element = element;
        this.element.id = "activeUnitView";
        this.element.innerHTML = Template;
        this.element.style.opacity = 0;

        //this.previewImage = this.element.querySelector('.active-unit-preview');
        this.hpBar = new RenderableProgressBar(this.element.querySelector('#activeUnitHP'));
        this.apBar = new RenderableProgressBar(this.element.querySelector('#activeUnitAP'));
    }

    ActiveUnitView.prototype.show = function (unit)
    {
        this.hpBar.setProgress(unit.hp, unit.maxHP);
        this.apBar.setProgress(unit.ap, unit.maxAP);

        var previousImage = this.previewImage;
        if (previousImage)
        {
            previousImage.style.position = 'absolute';
            previousImage.addEventListener('transitionend', function ()
            {
                this.element.removeChild(previousImage);
            }.bind(this));
        }

        var newImage = document.createElement('div');
        newImage.className = 'active-unit-preview unit-type-' + unit.weapon.type;
        this.element.insertBefore(newImage, this.hpBar.element);
        this.previewImage = newImage;

        this.element.style.opacity = 1;
        this.element.className = (unit.player.isLocal) ? 'player-team' : 'enemy-team';

        setTimeout(function ()
        {
            newImage.style.opacity = 1;
            if (previousImage)
                previousImage.style.opacity = 0;
        }, 0);
    };

    ActiveUnitView.prototype.hide = function ()
    {
        this.apBar.setBlink();
        this.element.style.opacity = 0;
    };

    ActiveUnitView.prototype.previewAP = function (ap)
    {
        this.apBar.setBlink(ap);
    };

    ActiveUnitView.prototype.setAP = function (ap, maxAP)
    {
        this.apBar.setProgress(ap, maxAP);
    };

    return ActiveUnitView;
});