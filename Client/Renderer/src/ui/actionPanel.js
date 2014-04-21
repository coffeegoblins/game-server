define(['./floatingPanel'], function (FloatingPanel)
{
    'use strict';

    function ActionPanel()
    {
        FloatingPanel.call(this);

        this.element.classList.add('action-panel');
        this.element.on('click', '.action', this.onActionClick.bind(this));

        this.actions = [
            {name: 'move', title: 'Move'},
            {name: 'endTurn', title: 'End Turn'}
        ];

        for (var i = 0; i < 5; i++)
        {
            var actionElement = document.createElement('div');
            actionElement.className = 'action';
            this.element.appendChild(actionElement);
        }
    }

    ActionPanel.prototype = Object.create(FloatingPanel.prototype);
    ActionPanel.prototype.constructor = ActionPanel;

    ActionPanel.prototype.onActionClick = function (e)
    {
        if (this.isVisible)
        {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!e.target.classList.contains('disabled'))
            {
                this.trigger('actionSelected', e.target.getAttribute('data-action-name'));
            }
        }
    };

    ActionPanel.prototype.open = function (target, attacks)
    {
        FloatingPanel.prototype.open.apply(this, arguments);

        this.actions.length = 2;
        this.actions.push.apply(this.actions, attacks);

        for (var i = 0; i < this.element.children.length; i++)
        {
            var action = this.actions[i];
            var actionElement = this.element.children[i];

            if (action.isDisabled)
                actionElement.classList.add('disabled');

            actionElement.title = action.displayName;
            actionElement.setAttribute('data-action-name', action.name);
        }
    };

    return ActionPanel;
});