var ObjectID = require('mongodb').ObjectID;
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

        var getUsersCollection = function (asyncCallback)
        {
            this.database.collection('users', function (error, collection)
            {
                if (error)
                {
                    throw 'Unable to select the users collection. ' + error;
                }

                console.log('Selected the users collection.');
                this.usersCollection = collection;

                asyncCallback();
            }.bind(this));
        }.bind(this);

        var getNotificationCollection = function (asyncCallback)
        {
            this.database.collection('notifications', function (error, collection)
            {
                if (error)
                {
                    throw 'Unable to select the notifications collection. ' + error;
                }

                console.log('Selected the notifications collection.');
                this.notificationsCollection = collection;
                asyncCallback();
            }.bind(this));
        }.bind(this);

        async.parallel([getUsersCollection, getNotificationCollection], function (error)
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

module.exports = new DatabaseManager();
