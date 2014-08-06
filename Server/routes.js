var UserManager = require('./userManager');
var NotificationManager = require('./notificationManager');
var ChallengeManager = require('./challengeManager');
var GameManager = require('./gameManager');
var LevelManager = require('./levelManager');
var socketioJwt = require('socketio-jwt');
var activeSocketConnections = {};

function pushEvent(event, userName)
{
    if (activeSocketConnections[userName])
    {
        var data = Array.prototype.slice.call(arguments).splice(2, arguments.length - 2);

        activeSocketConnections[userName].emit(event, data);
    }
}

module.exports = function (app, socketio, events, jwtSecret)
{
    var userManager = new UserManager(events, jwtSecret);
    var gameManager = new GameManager(events);
    var notificationManager = new NotificationManager(events, userManager, pushEvent);
    var challengeManager = new ChallengeManager(events, userManager, gameManager, notificationManager);
    var levelManager = new LevelManager(events);

    //---------------------------------------------------------------------------------------------
    // Unauthenticated Calls
    //---------------------------------------------------------------------------------------------
    app.post('/login', userManager.login.bind(userManager));
    app.post('/register', userManager.register.bind(userManager));


    //---------------------------------------------------------------------------------------------
    // Authenticated Calls
    //---------------------------------------------------------------------------------------------

    // All socketio events route through this auth check
    socketio.use(socketioJwt.authorize(
    {
        secret: jwtSecret,
        handshake: true
    }));

    socketio.sockets.on('connection', function (socket)
    {
        activeSocketConnections[socket.decoded_token.username] = socket;

        socket.on(events.disconnect.url, function ()
        {
            delete activeSocketConnections[socket.decoded_token.username];
        });

        socket.emit(events.connection.response.events, events);
        socket.emit(events.connection.response.userInfo, socket.decoded_token);

        function responseCallback()
        {
            socket.emit.apply(socket, Array.prototype.slice.call(arguments, 0));
        }

        socket.on(events.playerSearch.url, userManager.searchForPlayers.bind(userManager, responseCallback));

        socket.on(events.getNotifications.url, notificationManager.getNotifications.bind(notificationManager, responseCallback, socket.decoded_token.username));

        socket.on(events.getGames.url, gameManager.getGames.bind(gameManager, responseCallback, socket.decoded_token.username));
        socket.on(events.getGameLogic.url, gameManager.getGameLogic.bind(gameManager, responseCallback));
        socket.on(events.gameStateUpdate.url, gameManager.updateGame.bind(gameManager, responseCallback));

        socket.on(events.challengeUser.url, challengeManager.initiateChallenge.bind(challengeManager, responseCallback, socket.decoded_token.username));
        socket.on(events.challengeAccepted.url, challengeManager.acceptChallenge.bind(challengeManager, responseCallback, socket.decoded_token.username));
        socket.on(events.challengeDeclined.url, challengeManager.removeChallenge.bind(challengeManager, responseCallback, socket.decoded_token.username));

        socket.on(events.getLevel.url, levelManager.getLevel.bind(levelManager, responseCallback));
        socket.on(events.getLevels.url, levelManager.getLevels.bind(levelManager, responseCallback));
    });
};
