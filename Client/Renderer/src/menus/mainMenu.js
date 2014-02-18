define(['text!Renderer/content/mainMenu.html', 'text!Renderer/content/game.html', 'Core/src/inputHandler', 'renderer', 'jsonLoader', 'Core/src/plotManager', './loginPopup'],
    function (MainMenuTemplate, GameTemplate, InputHandler, Renderer, loadJSON, PlotManager, LoginPopup)
    {
        function MainMenu()
        {

        }

        MainMenu.prototype.show = function ()
        {
            document.body.innerHTML = MainMenuTemplate;
            document.body.style.backgroundImage = 'url("Renderer/content/promo.png")';
            document.body.style.backgroundSize = '100%';

            InputHandler.registerClickEvent('singlePlayer', this.onSinglePlayerButtonClicked, this);
            InputHandler.registerClickEvent('multiPlayer', this.onMultiPlayerButtonClicked, this);
            InputHandler.registerClickEvent('options', this.onOptionsButtonClicked, this);
            InputHandler.registerClickEvent('exit', this.onExitButtonClicked, this);
        };

        MainMenu.prototype.hide = function ()
        {
            document.body.innerHTML = "";
            document.body.style.backgroundImage = '';

            InputHandler.unregisterClickEvent('singlePlayer');
            InputHandler.unregisterClickEvent('multiPlayer');
            InputHandler.unregisterClickEvent('options');
            InputHandler.unregisterClickEvent('exit');
        };

        MainMenu.prototype.onSinglePlayerButtonClicked = function (e)
        {
            this.hide();

            document.body.innerHTML = GameTemplate;
            Renderer.initialize(document.getElementById('canvas'));

            loadJSON('weapons', function (weaponData)
            {
                PlotManager.initialize(weaponData);
            });
        };

        MainMenu.prototype.onMultiPlayerButtonClicked = function (e)
        {
            LoginPopup.show();
        };

        MainMenu.prototype.onOptionsButtonClicked = function (e)
        {

        };

        MainMenu.prototype.onExitButtonClicked = function (e)
        {

        };

        return new MainMenu();
    });
