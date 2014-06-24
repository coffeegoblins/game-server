var mongoDB = require('mongodb');
var async = require('async');

function DatabaseManager()
{

}

DatabaseManager.prototype.open = function (dbName, dbHost, dbPort, callback)
{
    console.log('Opening database ' + dbName + ' on ' + dbHost + ':' + dbPort);

    this.database = new mongoDB.Db(dbName, new mongoDB.Server(dbHost, dbPort),
    {
        fsync: true
    });

    this.database.open(function (error)
    {
        if (error)
        {
            console.log('Unable to open the database. ' + error);
            return;
        }

        console.log('Connected to ' + dbHost + ":" + dbPort);

        async.parallel([
            this.getCollection.bind(this, 'users'),
            this.getCollection.bind(this, 'notifications'),
            this.getCollection.bind(this, 'games'),
            this.getCollection.bind(this, 'levels')
        ],
            function (error)
            {
                if (error)
                {
                    console.log(error);
                    return;
                }

                callback();
            });
    }.bind(this));
};

DatabaseManager.prototype.getCollection = function (collectionName, asyncCallback)
{
    this.database.collection(collectionName, function (error, collection)
    {
        if (error)
        {
            throw 'Unable to select the users collection. ' + error;
        }

        console.log('Selected the ' + collectionName + ' collection.');
        this[collectionName + 'Collection'] = collection;

        asyncCallback();
    }.bind(this));
};

module.exports = exports = new DatabaseManager();
