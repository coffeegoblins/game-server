var fileSystem = require('fs');
var atob = require('atob');
var mongoDB = require('mongodb');
var userManager = null;

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

var database = new mongoDB.Db(dbName, new mongoDB.Server(dbHost, dbPort));

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
});

io.set('authorization', function (request, callback)
{
    var token = request.query.token;

    if (!token)
    {
        return;
    }

    var decryptedToken = atob(token);
    var credentials = decryptedToken.split(":");

    userManager.login(credentials[0], credentials[1], function (error)
    {
        callback(error, error === null);
    });
});

io.sockets.on('connection', function (socket)
{
    console.log('connected!');

//    socket.on('test', function ()
//    {
//        console.log('test');
//    });
});
