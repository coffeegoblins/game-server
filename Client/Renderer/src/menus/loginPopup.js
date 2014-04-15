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
            this.usernameInput = document.getElementById('usernameInput');
            this.passwordInput = document.getElementById('passwordInput');
            this.confirmPasswordInput = document.getElementById('confirmPasswordInput');

            document.getElementById('loginButton').addEventListener('click', this.onLoginButtonClicked.bind(this), false);
            document.getElementById('registerButton').addEventListener('click', this.onRegisterButtonClicked.bind(this), false);
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
        
        LoginPopup.prototype.onRegisterButtonClicked = function ()
        {
            if (this.passwordInput.value !== this.confirmPasswordInput.value)
            {
                this.errorMessage.textContent = 'Passwords did not match!';
                return;
            }

            this.connect(function () 
            {  
                this.socket.emit('register', this.usernameInput.value, btoa(this.passwordInput.value));

                this.socket.on('registration_succeeded', function ()
                {
                    console.log('Registration Succeeded');
                    this.loadLobby();
                }.bind(this));

                this.socket.on('registration_failed', function (error)
                {
                    if (error)
                    {
                        this.warningIcon.style.display = "";
                        this.errorMessage.innerHTML = error;
                    }
                }.bind(this));
            }.bind(this));
        };

        LoginPopup.prototype.onLoginButtonClicked = function ()
        {
            this.connect(function () 
            {
                this.socket.emit('login', this.usernameInput.value, btoa(this.passwordInput.value));

                this.socket.on('login_failed', function (error)
                {
                    if (error)
                    {
                        this.warningIcon.style.display = "";
                        this.errorMessage.innerHTML = error;
                    }
                }.bind(this));

                this.socket.on('login_succeeded', function ()
                {
                    this.loadLobby();
                }.bind(this));
                
            }.bind(this));
        };

        LoginPopup.prototype.loadLobby = function ()
        {
            this.hide();
            LobbyMenu.show();
        };

        LoginPopup.prototype.connect = function ()
        {
            this.socket = io.connect('http://127.0.0.1:1988');
            
            this.socket.on('error', function (error)
            {
                this.errorMessage.innerHTML = 'Unable to connect to the server.';
            }.bind(this));
            
            this.socket.on('connect_error', function ()
            {
                this.errorMessage.innerHTML = 'Unable to connect to the server.';
            }.bind(this));
            
            this.socket.on('connect_failed', function ()
            {
                this.errorMessage.innerHTML = 'Unable to connect to the server.';
            }.bind(this));
        };

        return LoginPopup;
    });