var gameLogic = {
    version: 0.1
};

// Merge all of the logic from the other sections in place
var logicalComponents = [
    require('./attackLogic'),
    require('./movementLogic'),
    require('./unitLogic')
];

for (var i = 0; i < logicalComponents.length; i++)
{
    var component = logicalComponents[i];
    for (var property in component)
        gameLogic[property] = component[property];
}

module.exports = gameLogic;