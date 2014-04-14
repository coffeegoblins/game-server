define(['text!Renderer/content/templates/loginPopup.html', 'Core/src/inputHandler', 'lib/socket.io', 'Renderer/src/menus/lobbyMenu'],
    function (Template, InputHandler, io, LobbyMenu)
    {
        function LoginPopup(mainMenu)
        {
            this.mainMenu = mainMenu;
        }

        LoginPopup.prototype.show = function ()
        {
            document.getElementById('content').innerHTML += Template;
            
            InputHandler.registerClickEvent('cancelButton', this.onCancelButtonClicked, this);
            InputHandler.registerClickEvent('registerTab', this.onRegisterTabClicked, this);
            InputHandler.registerClickEvent('loginTab', this.onLoginTabClicked, this);
            InputHandler.registerClickEvent('loginButton', this.onLoginButtonClicked, this);
            InputHandler.registerClickEvent('registerButton', this.onRegisterButtonClicked, this);

            this.confirmPasswordBox = document.getElementById('confirmPasswordBox');
            this.loginTab = document.getElementById('loginTab');
            this.loginButton = document.getElementById('loginButton');
            this.registerTab = document.getElementById('registerTab');
            this.registerButton = document.getElementById('registerButton');
            this.warningIcon = document.getElementById('warningIcon');
            this.errorMessage = document.getElementById('errorMessage');
            
            this.warningIcon.style.display = 'none';
        };

        LoginPopup.prototype.hide = function ()
        {
            var popup = document.getElementById('overlay');
            if (popup)
            {
                popup.parentNode.removeChild(popup);
            }

            InputHandler.unregisterClickEvent('cancelButton');
            InputHandler.unregisterClickEvent('registerButton');
            InputHandler.unregisterClickEvent('loginButton');
            InputHandler.registerClickEvent('registerTab');
            InputHandler.registerClickEvent('loginTab');
        };

        LoginPopup.prototype.onCancelButtonClicked = function (e)
        {
            this.hide();
            this.mainMenu.mainMenuChains.className = 'lowerChains';
        };

        LoginPopup.prototype.onRegisterTabClicked = function (e)
        {
            if (this.confirmPasswordBox.style.display != 'block')
            {
                this.confirmPasswordBox.style.display = 'block';
                this.registerButton.style.display = null;
                this.loginButton.style.display = 'none';
                this.warningIcon.style.display = 'none';

                this.registerTab.className = 'tab';
                this.loginTab.className = 'unselectedTab';

                return;
            }
        };

        LoginPopup.prototype.onLoginTabClicked = function (e)
        {
            if (this.confirmPasswordBox.style.display === 'block')
            {
                this.confirmPasswordBox.style.display = 'none';
                this.registerButton.style.display = 'none';
                this.loginButton.style.display = null;
                this.warningIcon.style.display = 'none';

                this.registerTab.className = 'unselectedTab';
                this.loginTab.className = 'tab';

                return;
            }
        };

        LoginPopup.prototype.onRegisterButtonClicked = function (e)
        {
            var username = document.getElementById('usernameInput').value;
            var password = document.getElementById('passwordInput').value;
            var confirmPassword = document.getElementById('confirmPasswordInput').value;

            if (password !== confirmPassword)
            {
                this.warningIcon.style.display = null;
                this.errorMessage.innerHTML = 'Passwords did not match!';
                return;
            }
            
            this.connect(function () 
            {  
                this.socket.emit('register', username, btoa(password));

                this.socket.on('registration_succeeded', function ()
                {
                    console.log('Registration Succeeded');
                    this.loadLobby();
                }.bind(this));

                this.socket.on('registration_failed', function (error)
                {
                    if (error)
                    {
                        this.warningIcon.style.display = null;
                        this.errorMessage.innerHTML = error;
                    }
                }.bind(this));
            }.bind(this));
        };

        LoginPopup.prototype.onLoginButtonClicked = function (e)
        {
            var username = document.getElementById('usernameInput').value;
            var password = document.getElementById('passwordInput').value;
            
            this.connect(function () 
            {
                this.socket.emit('login', username, btoa(password));

                this.socket.on('login_failed', function (error)
                {
                    if (error)
                    {
                        this.warningIcon.style.display = null;
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
        
        LoginPopup.prototype.connect = function (callback)
        {
            this.socket = io.connect('http://127.0.0.1:1988');  
            
            this.socket.on('error', function (error)
            {
                this.warningIcon.style.display = null;
                this.errorMessage.innerHTML = 'Unable to connect to the server.';
            }.bind(this));
            
            this.socket.on('connect_error', function ()
            {
                this.warningIcon.style.display = null;
                this.errorMessage.innerHTML = 'Unable to connect to the server.';
            }.bind(this));
            
            this.socket.on('connect_failed', function ()
            {
                this.warningIcon.style.display = null;
                this.errorMessage.innerHTML = 'Unable to connect to the server.';
            }.bind(this));
            
            this.socket.on('connect', callback);
        };

        return LoginPopup;
    });