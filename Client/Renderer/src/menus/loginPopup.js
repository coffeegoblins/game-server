define(['text!Renderer/content/loginPopup.html', 'Core/src/inputHandler', 'lib/socket.io'],
    function (Template, InputHandler, io)
    {
        function LoginPopup()
        {

        }

        LoginPopup.prototype.show = function ()
        {
            document.body.innerHTML += Template;

            this.confirmPasswordBox = document.getElementById('confirmPasswordBox');
            this.confirmPasswordBox.style.display = 'none';

            InputHandler.registerClickEvent('cancelButton', this.onCancelButtonClicked, this);
            InputHandler.registerClickEvent('registerButton', this.onRegisterButtonClicked, this);
            InputHandler.registerClickEvent('loginButton', this.onLoginButtonClicked, this);
            InputHandler.registerClickEvent('usernameInput', this.onInputElementFocused, this);
            InputHandler.registerClickEvent('passwordInput', this.onInputElementFocused, this);
            InputHandler.registerClickEvent('confirmPasswordInput', this.onInputElementFocused, this);

            this.socket = io.connect('http://127.0.0.1:1988');
        };

        LoginPopup.prototype.hide = function ()
        {
            document.getElementById('loginPopup').remove();

            InputHandler.unregisterClickEvent('cancelButton');
            InputHandler.unregisterClickEvent('registerButton');
            InputHandler.unregisterClickEvent('loginButton');
        };

        LoginPopup.prototype.onCancelButtonClicked = function (e)
        {
            this.hide();
        };

        LoginPopup.prototype.onRegisterButtonClicked = function (e)
        {
            if (this.confirmPasswordBox.style.display != 'block')
            {
                this.confirmPasswordBox.style.display = 'block';
                return;
            }

            var username = document.getElementById('usernameInput').value;
            var password = document.getElementById('passwordInput').value;

            this.socket.emit('register', username, btoa(password));

            this.socket.on('registration_succeeded', function ()
            {
                console.log('Registration Succeeded');
            });

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
                console.log();
            });
        };

        LoginPopup.prototype.onInputElementFocused = function (e)
        {
            e.srcElement.focus();
        };

        return new LoginPopup();
    });
