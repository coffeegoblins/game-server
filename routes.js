var UserManager = require('./userManager');
var socketioJwt = require('socketio-jwt');
var activeSocketConnections = {};

module.exports = function (app, socketio, events, jwtSecret)
{
    var userManager = new UserManager(events, jwtSecret);

    //---------------------------------------------------------------------------------------------
    // Unauthenticated Calls
    //---------------------------------------------------------------------------------------------
    app.post('/login', userManager.login.bind(userManager));
    app.post('/register', userManager.register.bind(userManager));

    app.get('/', function (request, response)
    {
        response.send("Server is running");
    });

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

        socket.events = events;
        socket.pushEvent = function (eventUrl, usernames, data)
        {
            for (var i = 0; i < usernames.length; ++i)
            {
                var username = usernames[i];
                if (activeSocketConnections[username])
                {
                    activeSocketConnections[username].emit(eventUrl, data);
                }
            }
        };

        socket.emit(events.connection.response.events, events);
        socket.emit(events.connection.response.userInfo, socket.decoded_token);

        function socketEvent(event, route)
        {
            socket.on(event.url, function ()
            {
                var socketArguments = arguments;

                route.validate(socket.decoded_token, socketArguments, function (error)
                {
                    if (error)
                    {
                        console.log(event.response.error, error);
                        socket.emit(event.response.error, error);
                        return;
                    }

                    route.execute(socket, socketArguments);
                });
            });
        }

        socket.on(events.disconnect.url, function ()
        {
            delete activeSocketConnections[socket.decoded_token.username];
        });

        socketEvent(events.getGameLogic, require('./routes/getGameLogic'));
        socketEvent(events.userSearch, require('./routes/userSearch'));
        socketEvent(events.createGame, require('./routes/createGame'));
        socketEvent(events.updateGame, require('./routes/updateGame'));
        socketEvent(events.getLevel, require('./routes/getLevel'));
        socketEvent(events.getGames, require('./routes/getGames'));
        socketEvent(events.getLevels, require('./routes/getLevelNames'));
    });
};
