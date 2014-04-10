define(['text!Renderer/content/templates/mainMenu.html', 'text!Renderer/content/templates/game.html', 'Core/src/plotManager', './loginPopup', 'Core/src/browserNavigation'],
    function (MainMenuTemplate, GameTemplate, PlotManager, LoginPopup, BrowserNavigation)
    {
        'use strict';
        function MainMenu()
        {
            BrowserNavigation.on('root', this.show.bind(this));
            BrowserNavigation.on('singlePlayer', this.loadSinglePlayer.bind(this));

            this.loginPopup = new LoginPopup(this);
        }

        MainMenu.prototype.show = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.className = 'main-menu';

            this.mainMenuChains = document.getElementById('mainMenuChains');
            this.mainMenuChains.on('click', '.menuItem p', this.onMenuItemClicked.bind(this));
            this.lowerMenu();
        };

        MainMenu.prototype.hide = function ()
        {
            document.body.innerHTML = "";
        };

        MainMenu.prototype.onMenuItemClicked = function (e)
        {
            switch (e.target.id)
            {
                case 'singlePlayer':
                    BrowserNavigation.addState('singlePlayer');
                    this.loadSinglePlayer();
                    break;
                case 'multiPlayer':
                    this.mainMenuChains.className = 'raiseChains';
                    setTimeout(this.loginPopup.show.bind(this.loginPopup), 0);
                    break;
                case 'options':

                    break;
                case 'exit':

                    break;
            }
        };

        MainMenu.prototype.loadSinglePlayer = function ()
        {
            this.hide();
            document.body.className = 'game';
            document.body.innerHTML = GameTemplate;
            PlotManager.loadLevel('level1');
        };

        MainMenu.prototype.lowerMenu = function ()
        {
            this.mainMenuChains.className = 'lowerChains';
        };

        return new MainMenu();
    });