var databaseManager = require('./databaseManager');
var UserManager = require('./userManager');
var NotificationManager = require('./notificationManager');
var ChallengeManager = require('./challengeManager');

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
    var challengeManager = new ChallengeManager(events);

    io.sockets.on('connection', function (socket)
    {
        socket.on('test', function(arg) { console.log(arg); });
        socket.emit(events.connection.response.events, events);

        function responseCallback()
        {
            socket.emit.apply(socket, Array.prototype.slice.call(arguments, 0));
        }

        function onLoginSucceeded(userID)
        {
            socket.userID = userID;

            socket.on(events.searchByUsername.name, userManager.selectPlayers.bind(userManager, responseCallback));
            socket.on(events.gameStateUpdate.name, function () {}.bind(userManager, responseCallback));
            socket.on(events.getNotifications.name, notificationManager.getNotifications.bind(notificationManager, responseCallback, socket.userID))

            socket.on(events.challengeUser.name, challengeManager.initiateChallenge.bind(challengeManager, responseCallback, socket.userID));
            socket.on(events.challengeAccepted.name, challengeManager.acceptChallenge.bind(challengeManager, responseCallback, socket.userID));
            socket.on(events.challengeDeclined.name, challengeManager.declineChallenge.bind(challengeManager, responseCallback, socket.userID));
        }

        socket.on(events.login.name, userManager.login.bind(userManager, responseCallback, onLoginSucceeded));
        socket.on(events.register.name, userManager.register.bind(userManager, responseCallback, onLoginSucceeded));
    });
});
