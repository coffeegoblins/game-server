define(['Game/src/inputHandler', 'Renderer/src/ui/ImageView', 'Game/src/imageCache'],
function (InputHandler, ImageView, ImageCache)
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

    ActionBarView.prototype.hideActions = function()
    {
        this.parentDiv.innerHTML = "";

        for (var i = 0; i < this.actionsList.length; ++i)
        {
            InputHandler.unregisterEvent(this.actionsList[i].id);
        }

        this.actionsList = [];
    };

    ActionBarView.prototype.showActions = function(actions)
    {
        for (var i = 0; i < actions.length; ++i)
        {
            this.actionsList.push(actions[i]);

            new ImageView(this.parentDiv, actions[i].id, 10, 100, ImageCache.getImage(actions[i].id));

            InputHandler.registerEvent(actions[i].id, actions[i].method, actions[i].context);
        }
    };

    return new ActionBarView;
});
