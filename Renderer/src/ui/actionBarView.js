define(['Game/src/inputHandler', 'Renderer/src/effects/transitionEffect'],
    function (InputHandler, TransitionEffect)
    {
        'use strict';
        function ActionBarView()
        {
            this.actionsList = [];
            this.imageList = {
                'Move': 'Renderer/content/awesome.png',
                'EndTurn': 'Renderer/content/awesomeSad.png'
            };

            this.element = document.createElement('div');
            this.element.id = 'actionBarView';
            this.element.style.display = 'none';

            this.containerElement = document.createElement('div');
            this.element.appendChild(this.containerElement);

            document.body.appendChild(this.element);
        }

        ActionBarView.prototype.addActions = function (actions)
        {
            var fragment = document.createDocumentFragment();
            for (var i = 0; i < actions.length; ++i)
            {
                var action = actions[i];
                if (!this.getActionById(action.id))
                {
                    // If the action didn't already exist, create and register a visual for it
                    var image = document.createElement('img');
                    image.id = action.id;
                    image.src = this.imageList[action.id];

                    action.image = image;
                    this.actionsList.push(action);
                    InputHandler.registerEvent(action.id, action.method, action.context);

                    fragment.appendChild(image);
                }
            }

            this.containerElement.appendChild(fragment);
        };

        ActionBarView.prototype.getActionById = function (id)
        {
            for (var i = 0; i < this.actionsList.length; i++)
            {
                var action = this.actionsList[i];
                if (action.id === id)
                    return action;
            }
        };

        ActionBarView.prototype.removeActionById = function (id)
        {
            for (var i = 0; i < this.actionsList.length; i++)
            {
                var action = this.actionsList[i];
                if (action.id === id)
                {
                    if (action.image)
                    {
                        this.containerElement.removeChild(action.image);
                    }

                    InputHandler.unregisterEvent(action.id);
                    this.actionsList.splice(i, 1);
                    break;
                }
            }
        };

        ActionBarView.prototype.removeActions = function ()
        {
            for (var i = 0; i < arguments.length; ++i)
                this.removeActionById(arguments[i]);
        };

        ActionBarView.prototype.removeAllActions = function ()
        {
            // Remove and unregister any actions that are no longer needed
            this.actionsList.length = 0;
            while (this.containerElement.firstChild)
            {
                InputHandler.unregisterEvent(this.containerElement.firstChild.id);
                this.containerElement.removeChild(this.containerElement.firstChild);
            }
        };

        ActionBarView.prototype.hideActions = function ()
        {
            var element = this.element;
            TransitionEffect.transitionFloat('actionBarViewOpacity', this.element.style, 'opacity', null, 0, 0.5, null, function ()
            {
                element.style.display = 'none';
            });
        };

        ActionBarView.prototype.showActions = function ()
        {
            this.element.style.display = 'block';
            TransitionEffect.transitionFloat('actionBarViewOpacity', this.element.style, 'opacity', null, 1, 0.5);
        };

        return new ActionBarView();
    });