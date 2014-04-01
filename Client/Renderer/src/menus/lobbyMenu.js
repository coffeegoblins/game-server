define(['text!Renderer/content/templates/lobbyMenu.html', 'text!Renderer/content/templates/playerSearch.html', 'Core/src/inputHandler', 'lib/socket.io'],
    function (LobbyTemplate, PlayerSearchTemplate, InputHandler, io)
    {
        function LobbyMenu()
        {
            
        }

        LobbyMenu.prototype.show = function ()
        {
            document.body.backgroundColor = "#FFF";
            document.body.innerHTML = LobbyTemplate;

            this.navigationMenu = document.getElementById('navigationMenu');
            this.content = document.getElementById('content');

            InputHandler.registerClickEvent('navigationBar', this.toggleNavigationMenu, this);
            InputHandler.registerClickEvent('navigationButton', this.toggleNavigationMenu, this);
            
            InputHandler.registerClickEvent('notificationsButton', this.onNotificationButtonClicked, this);
            InputHandler.registerClickEvent('waitingOnYouButton', this.onWaitingOnYouButtonClicked, this);
            InputHandler.registerClickEvent('waitingOnThemButton', this.onWaitingOnThemButtonClicked, this);
            InputHandler.registerClickEvent('playerSearchButton', this.onPlayerSearchButtonClicked, this);
            
            this.mainMenuChains = document.getElementById('mainMenuChains');
            this.mainMenuChains.className = 'lowerChains';
        };

        LobbyMenu.prototype.hide = function ()
        {
            document.body.innerHTML = '';
        };
        
        LobbyMenu.prototype.onPlayerSearchButtonClicked = function (e)
        {
            this.mainMenuChains.className = 'raiseChains';
            this.content.innerHTML += PlayerSearchTemplate;
        };

        return new LobbyMenu();
    });
