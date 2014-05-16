var ObjectID = require('mongodb').ObjectID;
var databaseManager = require('./databaseManager');

function UserManager()
{

}

UserManager.prototype.login = function (responseCallback, loginSuccessCallback, username, password)
{
    var searchCriteria = {
        'username': username
    };

    console.log('Attempting to login ' + username + '.');

    databaseManager.usersCollection.findOne(searchCriteria, function (error, user)
    {
        if (error || !user || user.password !== password)
        {
            console.log('Invalid username or password for ' + username + '.');
            responseCallback('login_failed', 'Invalid username or password.');

            return;
        }

        console.log(username + ' has logged in.');
        responseCallback('login_succeeded', user);
        loginSuccessCallback();
    });
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

    var searchCriteria = {
        'lowerCaseUsername': lowerCaseUsername
    };

    databaseManager.usersCollection.findOne(searchCriteria, function (error, existingUser)
    {
        if (existingUser)
        {
            console.log(lowerCaseUsername + ' already exists as a user!');
            responseCallback('registration_failed', 'That username is already taken. Enter another username.');
            return;
        }

        console.log(lowerCaseUsername + ' does not exist. Creating...');

        databaseManager.usersCollection.insert(user, function (error, user)
        {
            if (error)
            {
                console.log('Error registering ' + lowerCaseUsername + '.' + error);
                responseCallback('registration_failed', error);
                return;
            }

            console.log(lowerCaseUsername + ' has been registered.');
            responseCallback('registration_succeeded', user);
        loginSuccessCallback();
        });
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
        responseCallback('player_search_failed', 'No players found.');
        return;
    }

    searchResults.toArray(function (error, result)
    {
        if (error)
        {
            responseCallback('player_search_failed', error);
            return;
        }

        responseCallback('player_search_succeeded', result);
    });
};

UserManager.prototype.selectPlayerByID = function (id, callback)
{
    var searchCriteria = {
        '_id': new ObjectID(id)
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
