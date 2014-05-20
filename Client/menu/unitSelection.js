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

        this.element = contentElement.querySelector('.unit-selection');
        this.confirmButton = contentElement.querySelector('[data-button="confirm"');
        //confirmButton.disabled = true;

        this.confirmButton.addEventListener('click', this.onConfirm.bind(this), false);
        contentElement.querySelector('.tab-header').on('click', '.unit-type', this.onTabClick.bind(this));
        contentElement.querySelector('[data-button="cancel"').addEventListener('click', this.onCancel.bind(this), false);
        return this;
    };

    UnitSelection.prototype.onCancel = function ()
    {
        this.trigger('cancel');
    };

    UnitSelection.prototype.onConfirm = function ()
    {
        this.trigger('confirm');
    };

    UnitSelection.prototype.onTabClick = function (e)
    {
        var tab = Utility.findParentElement(e.target, '.tab');
        if (tab.classList.contains('selected'))
            return;

        var selectedItems = this.element.querySelectorAll('.selected');
        for (var i = 0; i < selectedItems.length; i++)
            selectedItems[i].classList.remove('selected');

        tab.classList.add('selected');
        var unitType = tab.getAttribute('data-unit');
        this.element.querySelector('.tab-content[data-unit="' + unitType + '"]').classList.add('selected');
    };

    Events.register(UnitSelection.prototype);
    return UnitSelection;
});
