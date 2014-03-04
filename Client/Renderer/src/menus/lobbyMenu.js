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
        };

        LobbyMenu.prototype.hide = function ()
        {
            document.body.innerHTML = "";
        };

        return new LobbyMenu();
    });