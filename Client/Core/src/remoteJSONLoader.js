define([], function ()
{
    'use strict';

    function RemoteJSONLoader(socket)
    {
        this.socket = socket;
    }

    RemoteJSONLoader.prototype.loadLevel = function (levelName, onComplete)
    {
        this.socket.emit(this.socket.events.getLevelByName, levelName);
        this.socket.on(this.socket.events.getLevelByName.response.success, onComplete);
    };

    return RemoteJSONLoader;
});
