var databaseManager = require('./databaseManager');
var fileSystem = require('fs');

// Initial Config
var config = JSON.parse(fileSystem.readFileSync('./config.json'));

// Server
var app = require('express')();

// Enable Cross Origin Resource Sharing (CORS)
app.all('*', function (req, res, next)
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var server = require('http').createServer(app);
server.listen(config.port);

var socketio = require('socket.io').listen(server);

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    console.log("Database Ready.");

    require('./routes')(socketio);
});
