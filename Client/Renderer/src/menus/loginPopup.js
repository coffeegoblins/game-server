define(['text!Renderer/content/templates/loginPopup.html', 'Core/src/inputHandler', 'lib/socket.io'],
    function (Template, InputHandler, io)
    {
        function LoginPopup()
        {
        }

        LoginPopup.prototype.show = function ()
        {
            document.body.innerHTML += Template;
            
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
            
            this.confirmPasswordBox.style.display = 'none';
            this.registerButton.style.display = "none";
            
            this.socket = io.connect('http://127.0.0.1:1988');
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
        };

        LoginPopup.prototype.onRegisterTabClicked = function (e)
        {
            if (this.confirmPasswordBox.style.display != 'block')
            {
                this.confirmPasswordBox.style.display = 'block';
                this.registerButton.style.display = null;
                this.loginButton.style.display = 'none';
                
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

            this.socket.emit('register', username, btoa(password));

            this.socket.on('registration_succeeded', function ()
            {
                console.log('Registration Succeeded');
                this.hide();
            }.bind(this));

            this.socket.on('registration_failed', function (error)
            {
                console.log('Registration Failed.');
            });
        };

        LoginPopup.prototype.onLoginButtonClicked = function (e)
        {
            var username = document.getElementById('usernameInput').value;
            var password = document.getElementById('passwordInput').value;

            this.socket.emit('login', username, btoa(password));

            this.socket.on('login_failed', function (error)
            {
                console.log(error);
            });

            this.socket.on('login_succeeded', function ()
            {
                this.hide();
            }.bind(this));
        };

        return new LoginPopup();
    });
