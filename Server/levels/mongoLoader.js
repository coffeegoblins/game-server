var databaseManager = require('../databaseManager');

var fileSystem = require('fs');

// Initial Config
var config = JSON.parse(fileSystem.readFileSync('../config.json'));

databaseManager.open(config.dbName, config.dbHost, config.dbPort, function ()
{
    // Intentionally skip first two arguments: "node", "mongoLoader.js"
    for (var i = 2; i < process.argv.length; ++i)
    {
        var name = process.argv[i];

        fileSystem.readFile("./" + name + ".json", "", function (levelName, error, data)
        {
            if (error)
            {
                console.log(error);
                return;
            }

            var jsonData = JSON.parse(data);
            databaseManager.levelsCollection.insert(
            {
                name: levelName,
                data: jsonData,
                active: true
            }, function (error, item)
            {
                console.log("Success for " + levelName);
            });

        }.bind(this, name));
    }
});
