define(['text!Renderer/content/templates/mainMenu.html', 'text!Renderer/content/templates/game.html', 'Core/src/inputHandler', 'renderer', 'Core/src/plotManager', './loginPopup'],
    function (MainMenuTemplate, GameTemplate, InputHandler, Renderer, PlotManager, LoginPopup)
    {
        function MainMenu()
        {
        }

        MainMenu.prototype.show = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.className = 'main-menu';

            InputHandler.registerClickEvent('singlePlayer', this.onSinglePlayerButtonClicked, this);
            InputHandler.registerClickEvent('multiPlayer', this.onMultiPlayerButtonClicked, this);
            InputHandler.registerClickEvent('options', this.onOptionsButtonClicked, this);
            InputHandler.registerClickEvent('exit', this.onExitButtonClicked, this);

            this.onSinglePlayerButtonClicked();
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
            this.hide();

            document.body.className = 'game';
            document.body.innerHTML = GameTemplate;
            Renderer.initialize(document.getElementById('canvas'));
            PlotManager.loadLevel('level1');
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

        return new MainMenu();
    });
