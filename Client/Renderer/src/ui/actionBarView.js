define(['Core/src/inputHandler', 'Core/src/utility'],
    function (InputHandler, Utility)
    {
        'use strict';

        function ActionBarView(element)
        {
            this.actionsList = [];
            this.element = element;
            this.containerElement = this.element.querySelector('.action-container');
        }

        ActionBarView.prototype.addActions = function (actions)
        {
            if (!actions || !actions.length)
                return;

            var fragment = document.createDocumentFragment();
            for (var i = 0; i < actions.length; i++)
            {
                var action = actions[i];
                if (!Utility.getElementByProperty(this.actionsList, 'id', action.id))
                {
                    // If the action didn't already exist, create and register a visual for it
                    var actionElement = document.createElement('div');
                    actionElement.title = action.id;
                    actionElement.id = action.id;
                    actionElement.className = 'action action-' + action.id;

                    action.element = actionElement;
                    this.actionsList.push(action);
                    InputHandler.registerClickEvent(action.id, action.method, action.context);

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

        ActionBarView.prototype.removeActionById = function (id)
        {
            var action = Utility.removeElementByProperty(this.actionsList, 'id', id);
            if (action)
            {
                InputHandler.unregisterClickEvent(id);
                if (action.element)
                {
                    this.containerElement.removeChild(action.element);
                }
            }
        };

        ActionBarView.prototype.removeAllActions = function ()
        {
            // Remove and unregister any actions that are no longer needed
            this.actionsList.length = 0;
            while (this.containerElement.firstChild)
            {
                var childElement = this.containerElement.firstChild;
                if (childElement.id)
                {
                    InputHandler.unregisterClickEvent(childElement.id);
                }

                this.containerElement.removeChild(childElement);
            }
        };

        ActionBarView.prototype.hideActions = function ()
        {
            this.element.style.opacity = 0;
        };

        ActionBarView.prototype.showActions = function ()
        {
            this.element.style.opacity = 1;
        };

        return ActionBarView;
    });
