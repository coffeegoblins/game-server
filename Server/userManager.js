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
            callback(null);
            return;
        }

        console.log('Invalid username or password for ' + username + '.');
        callback('Invalid username or password.');
    });
};

UserManager.prototype.register = function (username, password, callback)
{
    var user = {
        username: username,
        password: password
    };

    console.log('Registering user: ' + username);

    var options = {
        safe: true
    };

    this.usersCollection.insert(user, options, function (error, user)
    {
        if (error)
        {
            console.log('Error registering ' + username + '.' + error);
            callback(error, null);
            return;
        }

        console.log(username + ' has been registered.');
        callback(null, user._id);
    });
};

module.exports = function (usersCollection)
{
    return new UserManager(usersCollection);
};
