define(['Game/src/inputHandler', 'Renderer/src/effects/transitionEffect', 'Game/src/utility'],
    function (InputHandler, TransitionEffect, Utility)
    {
        'use strict';
        function ActionBarView()
        {
            this.actionsList = [];
            this.imageList = {
                'Attack': 'Renderer/content/attackIcon.png',
                'Cancel': 'Renderer/content/cancelIcon.png',
                'EndTurn': 'Renderer/content/endTurnIcon.png',
                'Move': 'Renderer/content/moveIcon.png'
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
            for (var i = 0; i < actions.length; i++)
            {
                var action = actions[i];
                if (!Utility.getElementByProperty(this.actionsList, 'id', action.id))
                {
                    // If the action didn't already exist, create and register a visual for it
                    var image = document.createElement('img');
                    image.title = action.id;
                    image.id = action.id;
                    image.src = this.imageList[action.id];

                    action.image = image;
                    this.actionsList.push(action);
                    InputHandler.registerClickEvent(action.id, action.method, action.context);

                    fragment.appendChild(image);
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
                if (action.image)
                {
                    this.containerElement.removeChild(action.image);
                }
            }
        };

        ActionBarView.prototype.removeAllActions = function ()
        {
            // Remove and unregister any actions that are no longer needed
            this.actionsList.length = 0;
            while (this.containerElement.firstChild)
            {
                InputHandler.unregisterClickEvent(this.containerElement.firstChild.id);
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
            this.element.style.display = '';
            TransitionEffect.transitionFloat('actionBarViewOpacity', this.element.style, 'opacity', null, 1, 0.5);
        };

        return new ActionBarView();
    });