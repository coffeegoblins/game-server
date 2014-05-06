var ObjectID = require('mongodb').ObjectID;

function UserManager(usersCollection)
{
    this.usersCollection = usersCollection;
}

UserManager.prototype.ping = function (timestamp)
{
    // TODO: Implementation
};

UserManager.prototype.login = function (username, password, callback)
{
    var searchCriteria = {
        'username': username
    };

    console.log('Attempting to login ' + username + '.');

    this.usersCollection.findOne(searchCriteria, function (error, user)
    {
        if (!error && user && user.password === password)
        {
            console.log(username + ' has logged in.');
            callback(null, user);
            return;
        }

        console.log('Invalid username or password for ' + username + '.');
        callback('Invalid username or password.');
    });
};

UserManager.prototype.register = function (username, password, callback)
{
    var lowerCaseUsername = username.toLowerCase();
    
    var user = {
        username: username,
        lowerCaseUsername: lowerCaseUsername,
        password: password
    };

    console.log('Registering user: ' + lowerCaseUsername);

    this.usersCollection.findOne({'lowerCaseUsername': lowerCaseUsername}, function (error, existingUser)
    {
        if (existingUser)
        {
            console.log(lowerCaseUsername + ' already exists as a user!');
            callback('That username is already taken. Enter another username.', null);
            return;
        }

        console.log(lowerCaseUsername + ' does not exist. Creating...');

        this.usersCollection.insert(user, function (error, user)
        {
            if (error)
            {
                console.log('Error registering ' + lowerCaseUsername + '.' + error);
                callback(error, null);
                return;
            }

            console.log(lowerCaseUsername + ' has been registered.');
            callback(null, user);
        });
    }.bind(this));
};

UserManager.prototype.selectPlayers = function (searchCriteria, startingUsername)
{
    console.log(searchCriteria);
    
    var regex = new RegExp(searchCriteria);
    
    console.log(regex);
    
    var cursor = this.usersCollection.find({lowerCaseUsername: regex}).limit(200);
    
    console.log(cursor.count(function (x, y) { console.log(y); }));
    
    return cursor;
};

UserManager.prototype.selectPlayerByID = function (id, callback)
{
    this.usersCollection.findOne({'_id': new ObjectID(id)}, function (error, user)
    {
        if (!user)
        {
            callback('Unable to find a user with the id: ' + id, null);
            return;
        }

        callback(null, user);
    }.bind(this));
};

module.exports = function (usersCollection)
{
    return new UserManager(usersCollection);
};
