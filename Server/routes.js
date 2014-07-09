var UserManager = require('./userManager');
var NotificationManager = require('./notificationManager');
var ChallengeManager = require('./challengeManager');
var GameManager = require('./gameManager');
var LevelManager = require('./levelManager');

var fileSystem = require('fs');
var jwt = require('jsonwebtoken');
var jwtSecret = 'COFFEEGOBLINS';
var socketioJwt = require('socketio-jwt');

// Socket IO Events
var events = JSON.parse(fileSystem.readFileSync('./events.json'));

var userManager = new UserManager(events);
var notificationManager = new NotificationManager(events);
var challengeManager = new ChallengeManager(events);
var gameManager = new GameManager(events);
var levelManager = new LevelManager(events);

module.exports = function (app, socketio)
{
    app.post('/login', function (req, res)
    {
        userManager.selectPlayer(req.body.username, function (error, user)
        {
            if (error)
            {
                res.send(403, error);
                return;
            }

            var token = jwt.sign(user, jwtSecret,
            {
                expiresInMinutes: 60 * 5
            });

            res.json(
            {
                token: token
            });
        });
    });

    socketio.use(socketioJwt.authorize(
    {
        secret: jwtSecret,
        handshake: true
    }));

    socketio.sockets.on('connection', function (socket)
    {
        socket.emit(events.connection.response.events, events);

        function responseCallback()
        {
            socket.emit.apply(socket, Array.prototype.slice.call(arguments, 0));
        }

        function onLoginSucceeded(username)
        {
            socket.username = username;

            socket.on(events.searchByUsername.name, userManager.selectPlayers.bind(userManager, responseCallback));

            socket.on(events.getNotifications.name, notificationManager.getNotifications.bind(notificationManager, responseCallback, socket.username));

            socket.on(events.getGames.name, gameManager.getGames.bind(gameManager, responseCallback, socket.username));
            socket.on(events.getGameLogic.name, gameManager.getGameLogic.bind(gameManager, responseCallback));
            socket.on(events.gameStateUpdate.name, function () {}.bind(userManager, responseCallback));

            socket.on(events.challengeUser.name, challengeManager.initiateChallenge.bind(challengeManager, responseCallback, socket.username));
            socket.on(events.challengeAccepted.name, challengeManager.acceptChallenge.bind(challengeManager, responseCallback, socket.username));
            socket.on(events.challengeDeclined.name, challengeManager.removeChallenge.bind(challengeManager, responseCallback, socket.username));

            socket.on(events.getLevel.name, levelManager.getLevels.bind(levelManager, responseCallback));
            socket.on(events.getLevels.name, levelManager.getLevels.bind(levelManager, responseCallback));
        }

        socket.on(events.login.name, userManager.login.bind(userManager, responseCallback, onLoginSucceeded));
        socket.on(events.register.name, userManager.register.bind(userManager, responseCallback, onLoginSucceeded));
    });
};
