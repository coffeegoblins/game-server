var jwtSecret = 'COFFEEGOBLINS';

var fileSystem = require('fs');
var app = require('express')();
var bodyParser = require('body-parser');
var databaseManager = require('./databaseManager');
var server = require('http').createServer(app);
var socketio = require('socket.io').listen(server);
var phoneGap = require('connect-phonegap');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
{
    extended: true
}));

// app.use(phoneGap);

// Enable Cross Origin Resource Sharing (CORS)
app.all('*', function (req, res, next)
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "GET, POST, PUT, HEAD, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Headers", "*");

    next();
});

app.set('ipaddr', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);

var config = JSON.parse(fileSystem.readFileSync('./config/config.json'));
var socketEvents = JSON.parse(fileSystem.readFileSync('./events.json'));

databaseManager.open(config.dbName,
    process.env.OPENSHIFT_MONGODB_DB_HOST || config.dbHost,
    process.env.OPENSHIFT_MONGODB_DB_PORT || config.dbPort,
    process.env.OPENSHIFT_MONGODB_DB_USERNAME || "",
    process.env.OPENSHIFT_MONGODB_DB_PASSWORD || "",
    function ()
    {
        console.log("Database Ready.");

        require('./routes')(app, socketio, socketEvents, jwtSecret);

        server.listen(app.get('port'), app.get('ipaddr'), function ()
        {
            console.log('Express server listening on IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
        });
    });
