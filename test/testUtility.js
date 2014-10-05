var ObjectID = require("mongodb").ObjectID;

function setDefault(object, property, defaultValue)
{
    object[property] = object[property] || defaultValue;
}

module.exports.cloneObject = function (object)
{
    return JSON.parse(JSON.stringify(object));
};

module.exports.createUnit = function (parameters)
{
    if (!parameters)
    {
        parameters = {};
    }

    setDefault(parameters, '_id', new ObjectID().toString());
    setDefault(parameters, 'x', 0);
    setDefault(parameters, 'y', 0);
    setDefault(parameters, 'type', 'shield');
    setDefault(parameters, 'hp', 100);
    setDefault(parameters, 'ap', 100);
    setDefault(parameters, 'maxAP', 100);
    setDefault(parameters, 'username', Math.random().toString());
    setDefault(parameters, 'direction',
    {
        x: 0,
        y: 0
    });

    return {
        _id: parameters._id,
        x: parameters.x,
        y: parameters.y,
        type: parameters.type,
        hp: parameters.hp,
        ap: parameters.ap,
        maxAP: parameters.maxAP,
        username: parameters.username,
        direction: parameters.direction,
        target: parameters.target // Nullable
    };
};
