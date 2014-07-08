var fileSystem = require('fs');
var app = require('express')();
var bodyParser = require('body-parser');
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

server.listen(config.port);

var databaseManager = require('./databaseManager');
databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    console.log("Database Ready.");
    require('./routes')(app, socketio);
});
