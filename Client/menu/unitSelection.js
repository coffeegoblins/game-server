define(['text!./unitSelection.html', 'core/src/events', 'core/src/utility'], function (Template, Events, Utility)
{
    'use strict';
    function UnitSelection()
    {
    }

    UnitSelection.prototype.hide = function ()
    {
        var content = document.getElementById('content');
        while (content.lastChild)
            content.removeChild(content.lastChild);
    };

    UnitSelection.prototype.show = function ()
    {
        var contentElement = document.getElementById('content');
        Utility.insertTemplate(contentElement, Template);

        this.confirmButton = contentElement.querySelector('[data-button="confirm"');
        //confirmButton.disabled = true;

        this.confirmButton.addEventListener('click', function ()
        {
            this.trigger('confirm');
        }.bind(this), false);

        contentElement.querySelector('[data-button="cancel"').addEventListener('click', function ()
        {
            this.trigger('cancel');
        }.bind(this), false);

        return this;
    };


    Events.register(UnitSelection.prototype);
    return UnitSelection;
});
