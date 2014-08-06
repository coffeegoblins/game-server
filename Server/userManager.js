var ObjectID = require('mongodb').ObjectID;
var databaseManager = require('./databaseManager');
var jwt = require('jsonwebtoken');

function UserManager(events, jwtSecret)
{
    this.events = events;
    this.jwtSecret = jwtSecret;
}

UserManager.prototype.login = function (request, response)
{
    console.log('Attempting to login ' + request.body.username);

    this.selectPlayer(request.body.username, function (error, user)
    {
        // TODO  || user.password !== request.body.password
        if (error|| !user)
        {
            console.log(error);
            response.send(403, 'Invalid username or password.');
            return;
        }

        console.log(this.jwtSecret);

        var token = jwt.sign(user, this.jwtSecret,
        {
            expiresInMinutes: 1440 // 24 Hours
        });

        response.json(
        {
            token: token
        });

        console.log(user.username + ' connected!');
    }.bind(this));
};

UserManager.prototype.register = function (request, response)
{
    console.log('Attempting to register ' + request.body.username);

    // TODO Check blacklist

    var user = {
        username: request.body.username.toLowerCase(),
        displayName: request.body.username.toString(),
        password: request.body.password,
        notifications: [],
        creationTime: new Date().getTime()
    };

    console.log('Registering user ' + user.username);

    databaseManager.usersCollection.insert(user, function (error, createdUser)
    {
        if (error)
        {
            console.log(error);
            response.send(403, 'That username is already taken. Enter another username.');
            return;
        }

        console.log(user.username + ' has been registered.');

        response.send(200);
    }.bind(this));
};

UserManager.prototype.searchForPlayers = function (responseCallback, currentUser, searchCriteria, startingUsername)
{
    // TODO Filter characters
    var regex = new RegExp(searchCriteria);

    var searchResults = databaseManager.usersCollection.find(
    {
        username: regex
    }).limit(200);

    if (searchResults.length === 0)
    {
        responseCallback(this.events.playerSearch.response.error, 'No players found.');
        return;
    }

    searchResults.toArray(function (error, result)
    {
        if (error)
        {
            responseCallback(this.events.playerSearch.response.error, error);
            return;
        }

        responseCallback(this.events.playerSearch.response.success, result);
    }.bind(this));
};

UserManager.prototype.selectPlayer = function (username, callback)
{
    if (!username)
    {
        callback("No user name was provided");
        return;
    }

    var searchCriteria = {
        'username': username
    };

    databaseManager.usersCollection.findOne(searchCriteria, function (error, user)
    {
        if (!user)
        {
            callback('Unable to find a user with the name: ' + username + '\n' + error);
            return;
        }

        callback(null, user);
    }.bind(this));
};

module.exports = UserManager;
