define(['text!menu/multiplayerMenu.html', 'menu/menuNavigator', 'core/src/utility',
        'menu/loginMenu', 'menu/playerSearchMenu', 'menu/notificationsMenu',
        'menu/waitingOnYouMenu', 'menu/waitingOnThemMenu'],
    function (Template, MenuNavigator, Utility,
        LoginMenu, PlayerSearchMenu, NotificationsMenu,
        WaitingOnYouMenu, WaitingOnThemMenu)
    {
        return {
            show: function (parentElement)
            {
                this.parentElement = parentElement;

                if (!this.socket || !this.socket.connected)
                {
                    MenuNavigator.hide(parentElement);
                    LoginMenu.show(parentElement, function (socket, user)
                    {
                        this.socket = socket;
                        this.user = user;
                        this.show(parentElement);
                    }.bind(this));

                    return;
                }

                this.socket.on('disconnect', function ()
                {
                    localStorage.removeItem('token');

                    this.show(parentElement);
                }.bind(this));

                this.playerSearchMenu = new PlayerSearchMenu(this.socket);
                this.notificationsMenu = new NotificationsMenu(this.socket);
                this.waitingOnYouMenu = new WaitingOnYouMenu(this.socket);
                this.waitingOnThemMenu = new WaitingOnThemMenu(this.socket);

                Utility.insertTemplate(parentElement, Template);

                this.sideBar = document.getElementById('sideBar');
                this.contentDiv = document.getElementById('content');

                document.getElementById('menuIcon').addEventListener('click', this.onMenuIconClicked.bind(this));
                document.getElementById('logOutButton').addEventListener('click', this.disconnect.bind(this));
                document.getElementById('playerSearchButton').addEventListener('click', this.playerSearchMenu.show.bind(this, this.contentDiv));
                document.getElementById('notificationsButton').addEventListener('click', this.notificationsMenu.show.bind(this, this.contentDiv));
                document.getElementById('waitingOnYouButton').addEventListener('click', this.waitingOnYouMenu.show.bind(this.contentDiv));
                document.getElementById('waitingOnThemButton').addEventListener('click', this.waitingOnThemMenu.show.bind(this.contentDiv));
            },

            onMenuIconClicked: function ()
            {
                if (this.sideBar.className === "")
                {
                    this.sideBar.className = "collapsed";
                    return;
                }

                this.sideBar.className = "";
            },

            connect: function () {

            },

            disconnect: function ()
            {
                this.socket.disconnect();
            }

        };
    });
