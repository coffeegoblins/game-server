var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt-nodejs');
var databaseManager = require('./databaseManager');
var userManager = require('./userManager');

passport.use(new LocalStrategy(function (username, password, done)
{
    userManager.selectPlayer(username, function (error, user)
    {
        if (error)
        {
            return done(error);
        }

        if (user.password !== password)
        {
            return done('Invalid username or password.', false);
        }

        return done(null, user);
    });
}));

function SessionManager(events)
{
    this.events = events;
}

SessionManager.prototype.validatePassword = function (providedPassword, actualPassword)
{
    return bcrypt.compareSync(providedPassword, actualPassword);
};

SessionManager.prototype.generateHash = function (password)
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

SessionManager.prototype.login = function (responseCallback, loginSuccessCallback, username, password)
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
        loginSuccessCallback(user.username);
    }.bind(this));
};

SessionManager.prototype.register = function (responseCallback, loginSuccessCallback, username, password)
{
    var lowerCaseUsername = username.toLowerCase();

    var user = {
        username: username,
        lowerCaseUsername: lowerCaseUsername,
        password: password,
        notifications: new Array(),
        creationTime: new Date().getTime()
    };

    console.log('Registering user: ' + lowerCaseUsername);

    databaseManager.usersCollection.insert(user, function (error, createdUser)
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
        loginSuccessCallback(createdUser.username);
    }.bind(this));
};

module.exports = SessionManager;
