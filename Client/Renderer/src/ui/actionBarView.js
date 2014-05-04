define(['core/src/inputHandler', 'core/src/utility'], function (InputHandler, Utility)
{
    'use strict';
    var maxOpacity = 0.8;

    function ActionBarView(element)
    {
        this.element = element;
        this.containerElement = this.element.querySelector('.action-container');
        InputHandler.addClickListener(this.containerElement, this.handleClick.bind(this));

        this.actionList = [];
        this.actionStates = [];
    }

    ActionBarView.prototype.addActionElements = function (actions)
    {
        if (!actions || !actions.length)
            return;

        var fragment = document.createDocumentFragment();
        for (var i = 0; i < actions.length; i++)
        {
            var action = actions[i];
            if (!Utility.getElementByProperty(this.actionList, 'name', action.name))
            {
                // If the action didn't already exist, create and register a visual for it
                var actionElement = document.createElement('div');
                actionElement.title = action.displayName || action.name;
                actionElement.className = 'action ' + action.name;

                if (action.isDisabled)
                    actionElement.classList.add('disabled');

                action.element = actionElement;
                this.actionList.push(action);
                fragment.appendChild(actionElement);

                if (i < actions.length - 1)
                {
                    var divider = document.createElement('div');
                    divider.className = 'divider';
                    fragment.appendChild(divider);
                }
            }
        }

        this.containerElement.appendChild(fragment);
    };

    ActionBarView.prototype.clear = function ()
    {
        this.actionStates.length = 0;
        this.removeAllActions();
    };

    ActionBarView.prototype.disableAction = function (name)
    {
        var action = Utility.getElementByProperty(this.actionList, 'name', name);
        if (action && !action.isDisabled)
        {
            action.isDisabled = true;
            action.element.classList.add('disabled');
        }
    };

    ActionBarView.prototype.enableAction = function (name)
    {
        var action = Utility.getElementByProperty(this.actionList, 'name', name);
        if (action && action.isDisabled)
        {
            action.isDisabled = false;
            action.element.classList.remove('disabled');
        }
    };

    ActionBarView.prototype.handleClick = function (e)
    {
        if (this.element.style.opacity != maxOpacity)
            return;

        if (e.target.classList.contains('action') && !e.target.classList.contains('disabled'))
        {
            var action = Utility.getElementByProperty(this.actionList, 'element', e.target);
            if (action)
            {
                action.method();
            }
        }

        return false;
    };

    ActionBarView.prototype.hide = function ()
    {
        this.element.style.opacity = 0;
    };

    ActionBarView.prototype.goToState = function (index)
    {
        if (index >= this.actionStates.length)
        {
            return;
        }

        this.removeAllActions();
        this.actionStates.length = index + 1;
        this.addActionElements(this.actionStates[index]);
    };

    ActionBarView.prototype.pushState = function (actions)
    {
        if (this.actionList.length)
            this.actionStates.push(this.actionList.slice());

        this.removeAllActions();
        this.addActionElements(actions);
    };

    ActionBarView.prototype.popState = function ()
    {
        this.removeAllActions();
        this.addActionElements(this.actionStates.pop());
    };

    ActionBarView.prototype.removeAllActions = function ()
    {
        this.actionList.length = 0;
        while (this.containerElement.firstChild)
            this.containerElement.removeChild(this.containerElement.firstChild);
    };

    ActionBarView.prototype.show = function ()
    {
        this.element.style.opacity = maxOpacity;
    };

    return ActionBarView;
});
