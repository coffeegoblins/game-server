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
    app.post('/login', function (request, response)
    {
        console.log('Attempting to login ' + request.body.username);

        userManager.selectPlayer(request.body.username, function (error, user)
        {
            if (error)
            {
                console.log(error);
                response.send(403, error);
                return;
            }

            var token = jwt.sign(user, jwtSecret,
            {
                expiresInMinutes: 1440 // 24 Hours
            });

            response.json(
            {
                token: token
            });

            console.log(request.body.username + ' connected!');
        });
    });

    app.post('/register', function (request, response)
    {
        console.log('Attempting to register ' + request.body.username);

        // TODO Check blacklist

        userManager.register(request.body.username, request.body.password, function (error, user)
        {
            if (error)
            {
                console.log(error);
                response.send(400, error);
                return;
            }

            response.send(200);

            console.log(response.body.username + ' registered!');
        });
    });

    socketio.use(socketioJwt.authorize(
    {
        secret: jwtSecret,
        handshake: true
    }));

    socketio.sockets.on('connection', function (socket)
    {
        console.log(socket.decoded_token.username + ' connected!');

        socket.emit(events.connection.response.events, events);
        socket.emit(events.connection.response.userInfo, socket.decoded_token);

        socket.on(events.disconnect.name, function ()
        {
            socket.disconnect();
        });

        function responseCallback()
        {
            socket.emit.apply(socket, Array.prototype.slice.call(arguments, 0));
        }

        socket.on(events.searchByUsername.name, userManager.selectPlayers.bind(userManager, responseCallback));

        socket.on(events.getNotifications.name, notificationManager.getNotifications.bind(notificationManager, responseCallback, socket.decoded_token.username));

        socket.on(events.getGames.name, gameManager.getGames.bind(gameManager, responseCallback, socket.decoded_token.username));
        socket.on(events.getGameLogic.name, gameManager.getGameLogic.bind(gameManager, responseCallback));
        socket.on(events.gameStateUpdate.name, function () {}.bind(userManager, responseCallback));

        socket.on(events.challengeUser.name, challengeManager.initiateChallenge.bind(challengeManager, responseCallback, socket.decoded_token.username));
        socket.on(events.challengeAccepted.name, challengeManager.acceptChallenge.bind(challengeManager, responseCallback, socket.decoded_token.username));
        socket.on(events.challengeDeclined.name, challengeManager.removeChallenge.bind(challengeManager, responseCallback, socket.decoded_token.username));

        socket.on(events.getLevel.name, levelManager.getLevel.bind(levelManager, responseCallback));
        socket.on(events.getLevels.name, levelManager.getLevels.bind(levelManager, responseCallback));
    });
};
