var MongoClient = require('mongodb').MongoClient;
var async = require('async');

DatabaseManager.prototype.collections = {
    users: 'users',
    notifications: 'notifications',
    games: 'games',
    levels: 'levels'
};

function DatabaseManager()
{

}

DatabaseManager.prototype.open = function (url, callback)
{
    MongoClient.connect(url, function (error, database)
    {
        this.database = database;
        
        if (error)
        {
            console.log('Unable to open the database. ' + error);
            return;
        }

        async.parallel([
            this.getCollection.bind(this, this.collections.users),
            this.getCollection.bind(this, this.collections.notifications),
            this.getCollection.bind(this, this.collections.games),
            this.getCollection.bind(this, this.collections.levels)
        ],
            function (error)
            {
                if (error)
                {
                    console.log(error);
                    return;
                }

                this.usersCollection.ensureIndex(
                {
                    username: 1
                },
                {
                    unique: true
                }, function (error)
                {
                    if (error)
                    {
                        console.log(error);
                        return;
                    }

                    callback();
                });
            }.bind(this));
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
