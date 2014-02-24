define(['./player'], function (Player)
{
    'use strict';
    function RemotePlayer()
    {
        Player.apply(this, arguments);
    }

    RemotePlayer.prototype = Object.create(Player.prototype);
    RemotePlayer.prototype.constructor = RemotePlayer;

    RemotePlayer.prototype.performTurn = function (unit)
    {
        Player.prototype.performTurn.call(this, unit);

        this.endTurn();
    };

    RemotePlayer.prototype.endTurn = function ()
    {
        Player.prototype.endTurn.call(this);
    };

    RemotePlayer.prototype.onAttackComplete = function ()
    {
    };

    RemotePlayer.prototype.onMoveComplete = function ()
    {
    };

    return RemotePlayer;
});