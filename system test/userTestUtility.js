define(['./lib/socket.io', './connectionUtility'], function (io, ConnectionUtility)
{
    'use strict';

    function UserTestUtility()
    {

    }

    UserTestUtility.prototype.createUser = function (socket, events, callback)
    {
        socket.emit(events.register.name, Math.random().toString(), Math.random().toString());

        socket.on(events.register.response.error, function(error)
        {
            callback(error);
        });

        socket.on(events.register.response.success, function(user)
        {
            callback(null, user);
        });
    };

    return new UserTestUtility();
});
