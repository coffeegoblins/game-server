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

app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);

var config = JSON.parse(fileSystem.readFileSync('./config/config.json'));
var socketEvents = JSON.parse(fileSystem.readFileSync('./events.json'));

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    console.log("Database Ready.");

    require('./routes')(app, socketio, socketEvents, jwtSecret);

    server.listen(process.env.OPENSHIFT_NODEJS_PORT || config.port);

    console.log('Listening...');
});
