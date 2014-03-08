define(['text!Renderer/content/templates/lobbyMenu.html', 'Core/src/inputHandler', 'lib/socket.io'],
    function (Template, InputHandler, io)
    {
        function LobbyMenu()
        {
            
        }

        LobbyMenu.prototype.show = function ()
        {
            document.body.backgroundColor = "#FFF";
            document.body.innerHTML = Template;

            this.menuBar = document.getElementById('menuBar');

            InputHandler.registerClickEvent('navBar', this.onNavButtonClicked, this);
            InputHandler.registerClickEvent('navButton', this.onNavButtonClicked, this);
        };

        LobbyMenu.prototype.hide = function ()
        {
            document.body.innerHTML = '';
        };

        LobbyMenu.prototype.onNavButtonClicked = function (e)
        {
            if (this.menuBar.className === 'active')
            {
                this.menuBar.className = 'inactive';
                return;
            }

            this.menuBar.className = 'active';
        };

        return new LobbyMenu();
    });
