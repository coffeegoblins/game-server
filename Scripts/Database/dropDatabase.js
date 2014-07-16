var SERVER_ROOT = '../../Server';

var databaseManager = require(SERVER_ROOT + '/databaseManager');
var fileSystem = require('fs');

// Initial Config
var config = JSON.parse(fileSystem.readFileSync(SERVER_ROOT + '/config/config.json'));

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    console.log('Dropping database...');
    databaseManager.database.dropDatabase();
    console.log('Database dropped.');
});
