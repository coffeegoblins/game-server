define(['text!menu/loginPopup.html', 'lib/socket.io', 'core/src/utility'],
    function (Template, io, Utility)
    {
        function LoginPopup(mainMenu)
        {
            this.mainMenu = mainMenu;
        }

        LoginPopup.prototype.show = function (loginSuccessCallback, loginSuccessContext)
        {
            this.loginSuccessCallback = loginSuccessCallback;
            this.loginSuccessContext = loginSuccessContext;

            Utility.insertTemplate(document.getElementById('content'), Template);
            this.loginPopup = document.getElementById('loginPopup');
            this.errorMessage = document.getElementById('errorMessage');
            this.usernameInput = document.getElementById('usernameInput');
            this.passwordInput = document.getElementById('passwordInput');
            this.confirmPasswordInput = document.getElementById('confirmPasswordInput');

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
                    this.hide();

                    if (this.loginSuccessCallback)
                    {
                        this.loginSuccessCallback.call(this.loginSuccessContext, this.socket);
                    }
                }.bind(this));

                this.socket.on('registration_failed', function (error)
                {
                    if (error)
                    {
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
                        this.errorMessage.innerHTML = error;
                    }
                }.bind(this));

                this.socket.on('login_succeeded', function ()
                {
                    this.hide();

                    if (this.loginSuccessCallback)
                    {
                        this.loginSuccessCallback.call(this.loginSuccessContext, this.socket);
                    }
                }.bind(this));

            }.bind(this));
        };

        LoginPopup.prototype.connect = function (callback)
        {
            this.socket = io.connect('http://127.0.0.1:1988');

            this.socket.on('connect', callback);

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
