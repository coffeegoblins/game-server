var fileSystem = require('fs');
var atob = require('atob');
var mongoDB = require('mongodb');
var userManager = null;
var notificationManager = null;

// Initial Config
var config = JSON.parse(fileSystem.readFileSync('./config.json'));
var host = config.host;
var port = config.port;
var dbHost = config.dbHost;
var dbPort = config.dbPort;
var dbName = config.dbName;

// Server
var app = require('express')();
app.use(app.router);

var server = require('http').createServer(app);
server.listen(port);

var io = require('socket.io').listen(server);
io.set('log level', 1);

console.log('Loading database ' + dbName + ' on ' + dbHost + ':' + dbPort);

var database = new mongoDB.Db(dbName, new mongoDB.Server(dbHost, dbPort),
{
    fsync: true
});

database.open(function (error)
{
    if (error)
    {
        console.log('Unable to open the database. ' + error);
        return;
    }

    console.log('Connected to ' + dbHost + ":" + dbPort);

    database.collection('users', function (error, collection)
    {
        if (error)
        {
            console.log('Unable to select the users collection. ' + error);
            return;
        }

        // Setup endpoint
        console.log('Selected the users collection.');
        userManager = require('./userManager')(collection);
    });

    database.collection('notifications', function (error, collection)
    {
        if (error)
        {
            console.log('Unable to select the notifications collection. ' + error);
            return;
        }

        // Setup endpoint
        console.log('Selected the notifications collection.');
        notificationManager = require('./notificationManager')(collection);
    });
});

// Enable Cross Origin Resource Sharing (CORS)
app.all('*', function (req, res, next)
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

io.sockets.on('connection', function (socket)
{
    socket.on('login', function (username, password)
    {
        userManager.login(username, password, function (error, user)
        {
            if (error)
            {
                socket.emit('login_failed', error);
                return;
            }

            socket.emit('login_succeeded', user);
            subscribeToEvents(socket);
        });
    });

    socket.on('register', function (username, password)
    {
        userManager.register(username, password, function (error, user)
        {
            if (error)
            {
                socket.emit('registration_failed', error);
                return;
            }

            socket.emit('registration_succeeded', user);
            subscribeToEvents(socket);
        });
    });
});

function subscribeToEvents(socket)
{
    socket.on('player_search', function (searchCriteria, startingUsername)
    {
        console.log('Player Search Called.');
        
        // TODO Filter characters
        var searchResults = userManager.selectPlayers(searchCriteria, startingUsername);
        
        if (searchResults.length === 0)
        {
            socket.emit('player_search_failed', 'No players found.');
        }
        
        searchResults.toArray(function (error, result)
        {
            socket.emit('player_search_succeeded', result);
        });
    });

    socket.on('player_challenge', function(challengerID, opponentID)
    {
        console.log("Player is being challenged.");

        userManager.selectPlayerByID(challengerID, function (challengerError, challengerUser)
        {
            if (challengerError)
            {
                socket.emit('player_challenge_error', challengerError);
                console.log(challengerError);
                return;
            }

            console.log("Challenger exists!");

            userManager.selectPlayerByID(opponentID, function(opponentError, opponentUser)
            {
                if (opponentError)
                {
                    socket.emit('player_challenge_error', opponentError);
                    console.log(opponentError);
                    return;
                }

                console.log("Opponent exists!");

                console.log(challengerUser.username + " (" + challengerUser._id + ") is challenging " + opponentUser.username + " (" + opponentUser._id + ")");

                notificationManager.initiateChallenge(challengerUser, opponentUser, function(error)
                {
                    socket.emit('player_challenge_error', error);
                    console.log("Failed to challenge.");
                });
            });
        });
    });
}
