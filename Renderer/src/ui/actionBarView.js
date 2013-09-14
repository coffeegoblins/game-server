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

        ActionBarView.prototype.hideActions = function ()
        {
            var element = this.element;
            TransitionEffect.transitionFloat(this.element, 'opacity', null, 0, 0.5, null, function ()
            {
                element.style.display = 'none';
            });
        };

        ActionBarView.prototype.showActions = function (actions)
        {
            this.element.style.opacity = 0;
            this.element.style.display = 'block';

            var fragment = document.createDocumentFragment();
            for (var i = 0; i < actions.length; ++i)
            {
                var action = actions[i];
                var image = this.containerElement.querySelector('#' + action.id);
                if (!image)
                {
                    // If the action didn't already exist, create and register a visual for it
                    image = document.createElement('img');
                    image.id = action.id;
                    image.src = this.imageList[action.id];

                    InputHandler.registerEvent(action.id, action.method, action.context);
                }

                fragment.appendChild(image);
            }

            // Remove and unregister any actions that are no longer needed
            while (this.containerElement.firstChild)
            {
                InputHandler.unregisterEvent(this.containerElement.firstChild.id);
                this.containerElement.removeChild(this.containerElement.firstChild);
            }

            // Update the actions
            this.actionsList = actions.slice(0);
            this.containerElement.appendChild(fragment);

            TransitionEffect.transitionFloat(this.element, 'opacity', null, 1, 0.5);
        };

        return new ActionBarView();
    });