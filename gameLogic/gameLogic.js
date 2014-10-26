var gameLogic = {
    version: 0.4
};

// Merge all of the logic from the other sections in place
var logicalComponents = [
    require('./unitLogic'),
    require('./utilityLogic'),
    require('./actionLogic/moveLogic'),
    require('./actionLogic/endTurnLogic'),
    require('./actionLogic/attackLogic')
];

for (var i = 0; i < logicalComponents.length; i++)
{
    var component = logicalComponents[i];
    for (var property in component)
    {
        gameLogic[property] = component[property];
    }
}

module.exports = gameLogic;
