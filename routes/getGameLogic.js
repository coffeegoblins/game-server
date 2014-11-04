var validator = require('../validator');
var gameLogic = require('../gameLogic/gameLogic');

var serializedGameLogic = JSON.stringify(gameLogic, function (key, value)
{
    return (typeof value === 'function') ? value.toString() : value;
});

module.exports = {
    validate: function (currentUser, version, callback)
    {
        if (!validator.isValidString(version))
        {
            callback("Invalid version provided.");
            return;
        }

        callback(null, version);
    },

    execute: function (socket, version)
    {
        if (version !== gameLogic.version)
        {
            socket.emit(socket.events.getGameLogic.response.success, serializedGameLogic);
        }
    }
};
