var validator = require('./validator');
var usersCollection = require('./databaseManager').usersCollection;
var jwt = require('jsonwebtoken');

function UserManager(events, jwtSecret)
{
    this.events = events;
    this.jwtSecret = jwtSecret;
}

UserManager.prototype.login = function (request, response)
{
    validator.isValidUser(request.body.username, function (error, user)
    {
        // TODO  || user.password !== request.body.password
        if (error || !user)
        {
            console.log(error);
            response.send(403, 'Invalid username or password.');
            return;
        }

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
    validator.isValidUser(request.body.username, function (error, user)
    {
        if (user)
        {
            response.send(403, 'That username is taken. Enter another username.');
            return;
        }

        user = {
            username: request.body.username,
            password: request.body.password,
            notifications: [],
            creationTime: new Date().getTime()
        };

        usersCollection.insert(user, function (error, createdUser)
        {
            if (error)
            {
                console.log("Unable to create new user.", error);
                response.send(403, 'Unable to create new account. Try again.');
                return;
            }

            response.send(200, createdUser);
        }.bind(this));
    });
};

module.exports = UserManager;
