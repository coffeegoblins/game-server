var databaseManager = require('./databaseManager');
var UserManager = require('./userManager');
var NotificationManager = require('./notificationManager');

var fileSystem = require('fs');
var atob = require('atob');

// Initial Config
var config = JSON.parse(fileSystem.readFileSync('./config.json'));

// Socket IO Events
var events = JSON.parse(fileSystem.readFileSync('./events.json'));

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

    var userManager = new UserManager(events);
    var notificationManager = new NotificationManager(events);

    io.sockets.on('connection', function (socket)
    {
        socket.on('test', function(arg) { console.log(arg); });
        socket.emit(events.connection.response.events, events);

        function responseCallback()
        {
            socket.emit.apply(socket, Array.prototype.slice.call(arguments, 0));
        }

        function subscribeToEvents()
        {
            socket.on(events.searchByUsername.name, userManager.selectPlayers.bind(userManager, responseCallback));
            socket.on(events.challengeUser.name, notificationManager.initiateChallenge.bind(notificationManager, responseCallback));
            socket.on(events.gameStateUpdate.name, function () {}.bind(userManager, responseCallback));
        }

        socket.on(events.login.name, userManager.login.bind(userManager, responseCallback, subscribeToEvents));
        socket.on(events.register.name, userManager.register.bind(userManager, responseCallback, subscribeToEvents));
    });
});
