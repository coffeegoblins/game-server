var databaseManager = require('./databaseManager');
var UserManager = require('./userManager');
var NotificationManager = require('./notificationManager');

var fileSystem = require('fs');
var atob = require('atob');

// Initial Config
var config = JSON.parse(fileSystem.readFileSync('./config.json'));

// Server
var app = require('express')();
app.use(app.router);

// Enable Cross Origin Resource Sharing (CORS)
app.all('*', function (req, res, next)
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var server = require('http').createServer(app);
server.listen(config.port);

var io = require('socket.io').listen(server);
io.set('log level', 1);

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    console.log("Database Ready.");

    var userManager = new UserManager(databaseManager);
    var notificationManager = new NotificationManager(databaseManager);

    io.sockets.on('connection', function (socket)
    {
        function responseCallback()
        {
            socket.emit.apply(socket, Array.prototype.slice.call(arguments, 0));
        }

        function subscribeToEvents()
        {
            socket.on('player_search', userManager.selectPlayers.bind(userManager, responseCallback));
            socket.on('player_challenge', notificationManager.initiateChallenge.bind(notificationManager, responseCallback));
            socket.on('game_update', function () {}.bind(userManager, responseCallback));
        }

        socket.on('login', userManager.login.bind(userManager, responseCallback, subscribeToEvents));
        socket.on('register', userManager.register.bind(userManager, responseCallback, subscribeToEvents));
    });
});
