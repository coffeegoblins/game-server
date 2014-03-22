define(['text!Renderer/content/templates/mainMenu.html', 'text!Renderer/content/templates/game.html', 'Core/src/inputHandler', 'Core/src/plotManager', './loginPopup', 'Core/src/browserNavigation'],
    function (MainMenuTemplate, GameTemplate, InputHandler, PlotManager, LoginPopup, BrowserNavigation)
    {
        'use strict';
        function MainMenu()
        {
            BrowserNavigation.on('root', this.show.bind(this));
            BrowserNavigation.on('singlePlayer', this.loadSinglePlayer.bind(this));
        }

        MainMenu.prototype.show = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.className = 'main-menu';

            InputHandler.registerClickEvent('singlePlayer', this.onSinglePlayerButtonClicked, this);
            InputHandler.registerClickEvent('multiPlayer', this.onMultiPlayerButtonClicked, this);
            InputHandler.registerClickEvent('options', this.onOptionsButtonClicked, this);
            InputHandler.registerClickEvent('exit', this.onExitButtonClicked, this);
        };

        MainMenu.prototype.hide = function ()
        {
            document.body.innerHTML = "";
            InputHandler.unregisterClickEvent('singlePlayer');
            InputHandler.unregisterClickEvent('multiPlayer');
            InputHandler.unregisterClickEvent('options');
            InputHandler.unregisterClickEvent('exit');
        };

        MainMenu.prototype.onSinglePlayerButtonClicked = function ()
        {
            BrowserNavigation.addState('singlePlayer');
            this.loadSinglePlayer();
        };

        MainMenu.prototype.onMultiPlayerButtonClicked = function ()
        {
            LoginPopup.show();
        };

        MainMenu.prototype.onOptionsButtonClicked = function ()
        {

        };

        MainMenu.prototype.onExitButtonClicked = function ()
        {

        };


        MainMenu.prototype.loadSinglePlayer = function ()
        {
            this.hide();
            document.body.className = 'game';
            document.body.innerHTML = GameTemplate;
            PlotManager.loadLevel('level1');
        };

        return new MainMenu();
    });
