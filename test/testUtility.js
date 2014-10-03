module.exports.cloneObject = function (object)
{
    return JSON.parse(JSON.stringify(object));
};