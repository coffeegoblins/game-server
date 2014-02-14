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

    this.usersCollection.findOne(searchCriteria, function (error, user)
    {
        if (!error && user && user.password === password)
        {
            callback(null);
            return;
        }

        console.log(password);
        callback('Invalid username or password.');
    });
};

module.exports = function (usersCollection)
{
    return new UserManager(usersCollection);
};
