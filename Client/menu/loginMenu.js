define(['text!menu/loginMenu.html', 'menu/menuNavigator', 'lib/socket.io', 'core/src/utility'],
    function (Template, MenuNavigator, io, Utility)
    {
        var SERVER_URL = 'http://127.0.0.1:1988';

        return {
            show: function (parentElement, loginSuccessCallback)
            {
                this.parentElement = parentElement;
                this.loginSuccessCallback = loginSuccessCallback;

                var token = localStorage.getItem('token');
                if (token)
                {
                    this.connectSocket(token, this.onLoggedIn.bind(this), function (error)
                    {
                        // Token is expired
                        localStorage.removeItem('token');

                        this.show(parentElement, loginSuccessCallback);
                    }.bind(this));

                    return;
                }

                Utility.insertTemplate(parentElement, Template);

                this.errorMessage = document.getElementById('errorMessage');
                this.usernameInput = document.getElementById('usernameInput');
                this.passwordInput = document.getElementById('passwordInput');
                this.confirmPasswordInput = document.getElementById('confirmPasswordInput');
                this.loginButton = document.getElementById('loginButton');
                this.registerButton = document.getElementById('registerButton');

                this.loginButton.addEventListener('click', this.login.bind(this), false);
                this.registerButton.addEventListener('click', this.register.bind(this), false);
            },

            setError: function (error)
            {
                if (error)
                {
                    this.errorMessage.innerHTML = error;
                }
            },

            onLoggedIn: function (socket)
            {
                socket.on('events', function (events)
                {
                    socket.events = events;

                    MenuNavigator.removeChildren(this.parentElement);
                }.bind(this));

                socket.on('userInfo', function (user)
                {
                    socket.user = user;

                    if (this.loginSuccessCallback)
                    {
                        this.loginSuccessCallback(socket);
                    }
                }.bind(this));
            },

            register: function ()
            {
                if (this.passwordInput.value !== this.confirmPasswordInput.value)
                {
                    this.errorMessage.textContent = 'Passwords did not match!';
                    return;
                }

                var request = new XMLHttpRequest();

                request.overrideMimeType('application/json');
                request.open('POST', SERVER_URL + '/register');
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.onreadystatechange = function ()
                {
                    // TODO Handle Error
                    if (request.readyState === 4)
                    {
                        if (request.status === 200)
                        {
                            this.login();
                            return;
                        }

                        this.errorMessage.innerHTML = request.statusText;
                    }
                }.bind(this);

                request.send('username=' + encodeURIComponent(this.usernameInput.value) + "&password=" + encodeURIComponent(this.passwordInput.value));
            },

            login: function ()
            {
                var request = new XMLHttpRequest();

                request.overrideMimeType('application/json');
                request.open('POST', SERVER_URL + '/login');
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.onreadystatechange = function ()
                {
                    // TODO Handle Error
                    if (request.readyState === 4 && request.status === 200)
                    {
                        var response = JSON.parse(request.responseText);

                        localStorage.setItem("token", response.token);

                        this.connectSocket(response.token, this.onLoggedIn.bind(this), this.setError.bind(this));
                    }
                }.bind(this);

                request.send('username=' + encodeURIComponent(this.usernameInput.value) + "&password=" + encodeURIComponent(btoa(this.passwordInput.value)));
            },

            connectSocket: function (token, successCallback, errorCallback)
            {
                var socket = io('http://127.0.0.1:1988',
                {
                    query: "token=" + token,
                    forceNew: true
                });

                socket.on('connect', successCallback.bind(this, socket));
                socket.on('error', errorCallback);
            }
        };
    });
