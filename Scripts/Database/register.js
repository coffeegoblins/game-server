var SERVER_ROOT = '../../Server';

var databaseManager = require(SERVER_ROOT + '/databaseManager');
var fileSystem = require('fs');
var http = require('http');
http.globalAgent.maxSockets = 1000;

// Initial Config
var config = JSON.parse(fileSystem.readFileSync(SERVER_ROOT + '/config/config.json'));

var options = {
    host: config.host,
    port: config.port,
    path: '/register',
    method: 'POST',
    headers:
    {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
};

function makeRequest(users)
{
    if (users.length === 0)
    {
        return;
    }

    var request = http.request(options, function (response)
    {
        response.on('data', function () {});

        users.splice(0, 1);
        makeRequest(users);
    });

    // write the request parameters
    console.log('Attempting to register ' + users[0]);
    request.write('username=' + users[0].toString() + '&password=a');
    request.end();
}

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    // Intentionally skip first two arguments: "node", "levelLoader.js"
    process.argv.splice(0, 2);

    makeRequest(process.argv);
});
