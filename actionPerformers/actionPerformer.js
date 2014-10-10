var GameLogic = require('../gameLogic/gameLogic');
var MovePerformer = require('./movePerformer');
var EndTurnPerformer = require('./endTurnPerformer');
var AttackPerformer = require('./attackPerformer');

var actionMap = {
    move: MovePerformer.perform,
    endturn: EndTurnPerformer.perform
};

for (var attackName in GameLogic.attacks)
{
    actionMap[attackName.toLowerCase()] = AttackPerformer.perform;
}

exports.perform = function (units, map, action)
{
    var lowerCaseName = action.type.toLowerCase();

    if (typeof actionMap[lowerCaseName] !== 'function')
    {
        console.log("The action type is invalid");
        return false;
    }

    return actionMap[lowerCaseName](units, map, action);
};