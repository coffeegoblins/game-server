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

            this.fragment = document.createDocumentFragment();

            document.body.appendChild(this.element);
        }

        ActionBarView.prototype.addActions = function(actions)
        {
            for (var i = 0; i < actions.length; ++i)
            {
                var action = actions[i];
                this.actionsList.push(actions[i]);

                var image = this.containerElement.querySelector('#' + action.id);
                if (!image)
                {
                    // If the action didn't already exist, create and register a visual for it
                    image = document.createElement('img');
                    image.id = action.id;
                    image.src = this.imageList[action.id];

                    InputHandler.registerEvent(action.id, action.method, action.context);
                }

                this.fragment.appendChild(image);
            }

            this.containerElement.appendChild(this.fragment);
        };

        ActionBarView.prototype.removeActions = function(actions)
        {
            for (var i = 0; i < actions.length; ++i)
            {
                var action = actions[i];
                var index = this.actionsList.indexOf(action);

                if (index > -1)
                    this.actionsList.splice(index, 1);

                var image = this.containerElement.querySelector('#' + action.id);
                if (image)
                {
                    InputHandler.unregisterEvent(image.id);
                    this.containerElement.removeChild(image);
                }
            }
        };

        ActionBarView.prototype.removeAllActions = function()
        {
            // Remove and unregister any actions that are no longer needed
            while (this.containerElement.firstChild)
            {
                InputHandler.unregisterEvent(this.containerElement.firstChild.id);
                this.containerElement.removeChild(this.containerElement.firstChild);
            }
        };

        ActionBarView.prototype.hideActions = function ()
        {
            var element = this.element;
            TransitionEffect.transitionFloat(this.element, 'opacity', null, 0, 0.5, null, function ()
            {
                element.style.display = 'none';
            });
        };

        ActionBarView.prototype.showActions = function ()
        {
            this.element.style.display = 'block';

            TransitionEffect.transitionFloat(this.element, 'opacity', null, 1, 0.5);
        };

        return new ActionBarView();
    });