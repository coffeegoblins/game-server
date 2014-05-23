var ObjectID = require('mongodb').ObjectID;
var databaseManager = require('./databaseManager');

function UserManager(events)
{
    this.events = events;
}

UserManager.prototype.login = function (responseCallback, loginSuccessCallback, username, password)
{
    var lowerCaseUsername = username.toLowerCase();

    var searchCriteria = {
        'lowerCaseUsername': lowerCaseUsername
    };

    console.log('Attempting to login ' + lowerCaseUsername + '.');

    databaseManager.usersCollection.findOne(searchCriteria, function (error, user)
    {
        if (error || !user || user.password !== password)
        {
            console.log('Invalid username or password for ' + lowerCaseUsername + '.');
            responseCallback(this.events.login.response.error, 'Invalid username or password.');

            return;
        }

        console.log(lowerCaseUsername + ' has logged in.');
        responseCallback(this.events.login.response.success, user);
        loginSuccessCallback();
    }.bind(this));
};

UserManager.prototype.register = function (responseCallback, loginSuccessCallback, username, password)
{
    var lowerCaseUsername = username.toLowerCase();

    var user = {
        username: username,
        lowerCaseUsername: lowerCaseUsername,
        password: password
    };

    console.log('Registering user: ' + lowerCaseUsername);

    databaseManager.usersCollection.insert(user, function (error)
    {
        if (error)
        {
            console.log('Unable to register ' + lowerCaseUsername);
            console.log(error);

            responseCallback(this.events.register.response.error, 'That username is already taken. Enter another username.');
            return;
        }

        console.log(lowerCaseUsername + ' has been registered.');

        responseCallback(this.events.register.response.success, user);
        loginSuccessCallback();
    }.bind(this));
};

UserManager.prototype.selectPlayers = function (responseCallback, searchCriteria, startingUsername)
{
    // TODO Filter characters
    var regex = new RegExp(searchCriteria);

    var searchResults = databaseManager.usersCollection.find(
    {
        lowerCaseUsername: regex
    }).limit(200);

    if (searchResults.length === 0)
    {
        responseCallback(this.events.searchByUsername.response.error, 'No players found.');
        return;
    }

    searchResults.toArray(function (error, result)
    {
        if (error)
        {
            responseCallback(this.events.searchByUsername.response.error, error);
            return;
        }

        responseCallback(this.events.searchByUsername.response.success, result);
    });
};

UserManager.prototype.selectPlayerByID = function (id, callback)
{
    var searchCriteria = {
        '_id ': new ObjectID(id)
    };

    databaseManager.usersCollection.findOne(searchCriteria, function (error, user)
    {
        if (!user)
        {
            callback('Unable to find a user with the id: ' + id, null);
            return;
        }

        callback(null, user);
    }.bind(this));
};

module.exports = UserManager;
