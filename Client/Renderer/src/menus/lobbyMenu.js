define(['text!Renderer/content/templates/lobbyMenu.html', 'text!Renderer/content/templates/playerSearch.html', 'lib/socket.io'],
    function (LobbyTemplate, PlayerSearchTemplate, io)
    {
        function LobbyMenu()
        {
        }

        LobbyMenu.prototype.show = function ()
        {
            document.body.innerHTML = LobbyTemplate;

            this.navigationMenu = document.getElementById('navigationMenu');
            this.content = document.getElementById('content');

            document.getElementById('navigationBar').addEventListener('click', this.toggleNavigationMenu.bind(this));
            document.getElementById('navigationButton').addEventListener('click', this.toggleNavigationMenu.bind(this));
            document.getElementById('notificationsButton').addEventListener('click', this.onNotificationButtonClicked.bind(this));
            document.getElementById('waitingOnYouButton').addEventListener('click', this.onWaitingOnYouButtonClicked.bind(this));
            document.getElementById('waitingOnThemButton').addEventListener('click', this.onWaitingOnThemButtonClicked.bind(this));
            document.getElementById('playerSearchButton').addEventListener('click', this.onPlayerSearchButtonClicked.bind(this));

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