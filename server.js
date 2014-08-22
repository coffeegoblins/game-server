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

databaseManager.open(config.dbName, 
                     process.env.OPENSHIFT_MONGODB_DB_HOST || config.dbHost, 
                     process.env.OPENSHIFT_MONGODB_DB_PORT || config.dbPort, 
                     process.env.OPENSHIFT_MONGODB_DB_USERNAME || "",
                     process.env.OPENSHIFT_MONGODB_DB_PASSWORD || "",
                     function ()
{
    console.log("Database Ready.");

    require('./routes')(app, socketio, socketEvents, jwtSecret);

    console.log("Port: ");
    console.log(process.env.PORT);
    console.log(process.env.OPENSHIFT_INTERNAL_PORT);
    console.log(process.env.OPENSHIFT_NODEJS_PORT);
    console.log(process.env.port);
    
    server.listen(process.env.PORT || process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || config.port);

    console.log('Listening...');
});

