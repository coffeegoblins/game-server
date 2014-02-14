define(['text!Renderer/content/mainMenu.html', 'Core/src/inputHandler', 'renderer', 'jsonLoader', 'Core/src/plotManager'],
    function (Template, InputHandler, Renderer, loadJSON, PlotManager)
    {
        function MainMenu()
        {

        }

        MainMenu.prototype.display = function ()
        {
            document.body.innerHTML = Template;
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

            document.body.innerHTML = "<canvas id='canvas' tabindex='0'></canvas>";

            Renderer.initialize(document.getElementById('canvas'));

            loadJSON('weapons', function (weaponData)
            {
                PlotManager.initialize(weaponData);
            });
        };

        MainMenu.prototype.onMultiPlayerButtonClicked = function (e) {

        };

        MainMenu.prototype.onOptionsButtonClicked = function (e) {

        };

        MainMenu.prototype.onExitButtonClicked = function (e) {

        };

        return new MainMenu();
    });
