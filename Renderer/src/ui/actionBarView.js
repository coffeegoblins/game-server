define(['Game/src/inputHandler', 'Renderer/src/ui/ImageView', 'Game/src/imageCache', 'Renderer/src/effects/transitionEffect'],
    function (InputHandler, ImageView, ImageCache, TransitionEffect)
    {
        'use strict';
        function ActionBarView()
        {
            this.actionsList = [];

            this.parentDiv = document.createElement('div');
            this.parentDiv.style.width = "100%";
            this.parentDiv.style.height = "10%";
            this.parentDiv.style.position = "absolute";
            this.parentDiv.style.left = "0";
            this.parentDiv.style.bottom = "0";
            this.parentDiv.style.padding = "1%";
            this.parentDiv.style.backgroundColor = "rgba(0,0,0,0.25)";

            document.body.appendChild(this.parentDiv);

            ImageCache.loadImage("Move", "Renderer/content/awesome.png");
            ImageCache.loadImage("EndTurn", "Renderer/content/awesome_sad.png");
        }

        ActionBarView.prototype.hideActions = function ()
        {
            TransitionEffect.transitionFloat(this.parentDiv, "opacity", null, 0, 0.5, this, onActionBarHidden);

            for (var i = 0; i < this.actionsList.length; ++i)
            {
                InputHandler.unregisterEvent(this.actionsList[i].id);
            }
        };

        function onActionBarHidden(eventData)
        {
            this.parentDiv.style.display = "none";
            this.actionsList = [];

            while (this.parentDiv.firstChild)
                this.parentDiv.removeChild(this.parentDiv.firstChild);
        }

        ActionBarView.prototype.showActions = function (actions)
        {
            this.parentDiv.style.display = "block";

            while (this.parentDiv.firstChild)
                this.parentDiv.removeChild(this.parentDiv.firstChild);

            this.actionsList = [];
            this.parentDiv.style.opacity = 0;

            for (var i = 0; i < actions.length; ++i)
            {
                this.actionsList.push(actions[i]);

                new ImageView(this.parentDiv, actions[i].id, 10, 100, ImageCache.getImage(actions[i].id));

                InputHandler.registerEvent(actions[i].id, actions[i].method, actions[i].context);
            }

            TransitionEffect.transitionFloat(this.parentDiv, "opacity", null, 1, 0.5);
        };

        return new ActionBarView;
    });
