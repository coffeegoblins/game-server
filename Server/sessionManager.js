function SessionManager(events)
{
    this.events = events;
}

SessionManager.prototype.disconnect = function (responseCallback, socket)
{
    socket.disconnect();
};

//SessionManager.prototype.validatePassword = function (providedPassword, actualPassword)
//{
//    return bcrypt.compareSync(providedPassword, actualPassword);
//};
//
//SessionManager.prototype.generateHash = function (password)
//{
//    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
//};

module.exports = SessionManager;
