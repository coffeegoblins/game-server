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
    var lowerCaseUsername = username.toLowerCase();
    
    var user = {
        username: username,
        lowerCaseUsername: lowerCaseUsername,
        password: password
    };

    console.log('Registering user: ' + lowerCaseUsername);

    this.usersCollection.findOne({'username': lowerCaseUsername}, function (error, existingUser)
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
            callback(null, user._id);
        });
    }.bind(this));
};

UserManager.prototype.selectPlayers = function (searchCriteria, startingUsername)
{
    var regex = new RegExp(searchCriteria);
    
    console.log(regex);
    
    var cursor = this.usersCollection.find({lowerCaseUsername: regex}).limit(50);
    
    console.log(cursor.count(function (x, y) { console.log(y); }));
    
    return cursor;
    
//    cursor.each(function (error, object) {
//        console.log("Object: ");
//        console.log(object);
//    });
    
    
//    //.toArray(function(err, results)
//    {
//        console.log(results); // output all records
//    });
//    this.usersCollection.find({'username' : searchCriteria}, function (error, cursor)
//    {
//        console.log(cursor);
//        console.log("Count: ");
//        console.log(cursor.count());
//        console.log("Next: ");
//        console.log(cursor.next());
//        console.log("Next Object: ");
//        console.log(cursor.nextObject());
//        console.log("Fields: ");
//        console.log(cursor.fields());
//    });
//    
//    var cursor = this.usersCollection.find({ 'username': searchCriteria });  
//    
//    console.log(cursor.toArray(function (array)
//                               {
//                                   console.log(array);
//                               }));
//    
};

module.exports = function (usersCollection)
{
    return new UserManager(usersCollection);
};
