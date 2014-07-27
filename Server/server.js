var jwtSecret = 'COFFEEGOBLINS';

var fileSystem = require('fs');
var app = require('express')();
var bodyParser = require('body-parser');
var databaseManager = require('./databaseManager');
var server = require('http').createServer(app);
var socketio = require('socket.io').listen(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: true
}));

// Enable Cross Origin Resource Sharing (CORS)
app.all('*', function (req, res, next)
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "GET,POST,PUT,HEAD,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

var config = JSON.parse(fileSystem.readFileSync('./config/config.json'));
var socketEvents = JSON.parse(fileSystem.readFileSync('./events.json'));

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    console.log("Database Ready.");

    require('./routes')(app, socketio, socketEvents, jwtSecret);

    server.listen(config.port);

    console.log('Listening...');
});
