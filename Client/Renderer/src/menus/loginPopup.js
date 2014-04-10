define(['text!Renderer/content/templates/loginPopup.html', 'lib/socket.io', 'Renderer/src/menus/lobbyMenu', 'Core/src/utility'],
    function (Template, io, LobbyMenu, Utility)
    {
        function LoginPopup(mainMenu)
        {
            this.mainMenu = mainMenu;
        }

        LoginPopup.prototype.show = function ()
        {
            Utility.insertTemplate(document.getElementById('content'), Template);
            this.loginPopup = document.getElementById('loginPopup');
            this.errorMessage = document.getElementById('errorMessage');

            document.getElementById('loginTab').addEventListener('click', this.onLoginTabClicked.bind(this), false);
            document.getElementById('registerTab').addEventListener('click', this.onRegisterTabClicked.bind(this), false);
            document.getElementById('loginButton').addEventListener('click', this.onLoginButtonClicked.bind(this), false);
            document.getElementById('registerButton').addEventListener('click', this.onRegisterButtonClicked.bind(this), false);
            document.getElementById('cancelButton').addEventListener('click', this.onCancelButtonClicked.bind(this), false);
        };

        LoginPopup.prototype.hide = function ()
        {
            var content = document.getElementById('content');
            while (content.lastChild)
                content.removeChild(content.lastChild);
        };

        LoginPopup.prototype.onCancelButtonClicked = function ()
        {
            this.hide();
            this.mainMenu.mainMenuChains.className = 'lowerChains';
        };

        LoginPopup.prototype.onRegisterTabClicked = function ()
        {
            this.errorMessage.textContent = '';
            this.loginPopup.className = 'register';
        };

        LoginPopup.prototype.onLoginTabClicked = function ()
        {
            this.errorMessage.textContent = '';
            this.loginPopup.className = 'login';
        };

        LoginPopup.prototype.onRegisterButtonClicked = function ()
        {
            var password = document.getElementById('passwordInput').value;
            var confirmPassword = document.getElementById('confirmPasswordInput').value;

            if (password !== confirmPassword)
            {
                this.errorMessage.textContent = 'Passwords did not match!';
                return;
            }

            if (!this.connect())
            {
                return;
            }

            var username = document.getElementById('usernameInput').value;
            this.socket.emit('register', username, btoa(password));

            this.socket.on('registration_succeeded', function ()
            {
                console.log('Registration Succeeded');
                this.loadLobby();
            }.bind(this));

            this.socket.on('registration_failed', function (error)
            {
                this.errorMessage.textContent = error || '';
            }.bind(this));
        };

        LoginPopup.prototype.onLoginButtonClicked = function ()
        {
            if (!this.connect())
            {
                return;
            }
        };

        LoginPopup.prototype.loadLobby = function ()
        {
            this.hide();
            LobbyMenu.show();
        };

        LoginPopup.prototype.connect = function ()
        {
            var username = document.getElementById('usernameInput').value;
            var password = document.getElementById('passwordInput').value;

            this.socket = io.connect('http://127.0.0.1:1988');
            this.socket.emit('login', username, btoa(password));

            this.socket.on('login_failed', function (error)
            {
                this.errorMessage.textContent = error || '';
            }.bind(this));

            this.socket.on('login_succeeded', function ()
            {
                this.loadLobby();
            }.bind(this));

            if (!this.socket.socket.connected)
            {
                this.errorMessage.textContent = 'Unable to connect to the server.';
                return false;
            }

            return true;
        };

        return LoginPopup;
    });