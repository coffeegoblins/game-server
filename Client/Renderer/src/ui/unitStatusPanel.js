define(['./floatingPanel', 'Renderer/src/ui/renderableProgressBar', 'text!../../content/templates/unitStatusPanel.html'], function (FloatingPanel, RenderableProgressBar, Template)
{
    'use strict';
    function UnitStatusPanel()
    {
        FloatingPanel.call(this);

        this.element.innerHTML = Template;
        this.element.classList.add('unit-status-panel');
        this.hpBar = new RenderableProgressBar(this.element.querySelector('.hp-bar'));
        this.apBar = new RenderableProgressBar(this.element.querySelector('.ap-bar'));
    }

    UnitStatusPanel.prototype = Object.create(FloatingPanel.prototype);
    UnitStatusPanel.prototype.constructor = UnitStatusPanel;

    UnitStatusPanel.prototype.hide = function ()
    {
        this.apBar.previewProgress();
        FloatingPanel.prototype.hide.call(this);
    };

    UnitStatusPanel.prototype.open = function ()
    {
        FloatingPanel.prototype.open.apply(this, arguments);
        this.updateValues();
    };

    UnitStatusPanel.prototype.previewAP = function (ap)
    {
        this.apBar.previewProgress(ap);
    };

    UnitStatusPanel.prototype.updateValues = function ()
    {
        if (this.target)
        {
            this.hpBar.setProgress(this.target.hp, this.target.maxHP);
            this.apBar.setProgress(this.target.ap, this.target.maxAP);
        }
    };

    return UnitStatusPanel;
});