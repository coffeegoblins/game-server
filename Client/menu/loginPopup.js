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
                this.socket.emit(this.socket.events.register.name, this.usernameInput.value, btoa(this.passwordInput.value));

                this.socket.on(this.socket.events.register.response.success, function (user)
                {
                    console.log('Registration Succeeded');
                    this.hide();

                    if (this.loginSuccessCallback)
                    {
                        this.loginSuccessCallback.call(this.loginSuccessContext, this.socket, user);
                    }
                }.bind(this));

                this.socket.on(this.socket.events.register.response.error, function (error)
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
                this.socket.emit(this.socket.events.login.name, this.usernameInput.value, btoa(this.passwordInput.value));

                this.socket.on(this.socket.events.login.response.error, function (error)
                {
                    if (error)
                    {
                        this.errorMessage.innerHTML = error;
                    }
                }.bind(this));

                this.socket.on(this.socket.events.login.response.success, function (user)
                {
                    this.hide();

                    if (this.loginSuccessCallback)
                    {
                        this.loginSuccessCallback.call(this.loginSuccessContext, this.socket, user);
                    }
                }.bind(this));

            }.bind(this));
        };

        LoginPopup.prototype.connect = function (callback)
        {
            if (this.socket && this.socket.connected)
            {
                callback();
            }

            var request = new XMLHttpRequest();
            request.overrideMimeType('application/json');
            var params = 'username=' + encodeURIComponent(this.usernameInput.value) + "&password=" + encodeURIComponent(btoa(this.passwordInput.value));
            request.open('POST', 'http://127.0.0.1:1988/login');

            //Send the proper header information along with the request
            request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            request.onreadystatechange = function ()
            {
                // TODO Handle Error
                if (request.readyState === 4 && request.status === 200)
                {
                    var response = JSON.parse(request.responseText);
                    console.log(response);

                    if (typeof(Storage) != "undefined") {
                        localStorage.setItem("token", response.token);
                    }

                    this.socket = io('http://127.0.0.1:1988/',
                    {
                        query: "token=" + response.token;
                    });

                    this.socket.on('connect', function ()
                    {
                        this.socket.on('events', function (events)
                        {
                            this.socket.events = events;
                            callback();
                        }.bind(this));
                    }.bind(this));

                    this.socket.on('error', function (error)
                    {
                        this.errorMessage.innerHTML = 'Unable to connect to the server. \n' + error;
                    }.bind(this));
                }
            }.bind(this);

            request.send(params);
        };

        return LoginPopup;
    });
