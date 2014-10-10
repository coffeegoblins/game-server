//AttackLogic.calculateCrossNodes = function (unit, selectedNode, availableNodes)
//{
//    var crossNodes = [];
//    var x = selectedNode.x;
//    var y = selectedNode.y;
//
//    for (var i = 0; i < availableNodes.length; ++i)
//    {
//        var node = availableNodes[i];
//        if (node.tile.unit !== unit &&
//            (node.x === x && Math.abs(node.y - y) === 1) ||
//            (node.y === y && Math.abs(node.x - x) === 1))
//        {
//            crossNodes.push(node);
//        }
//    }
//
//    return crossNodes;
//};

var CommonAttackLogic = require('./commonAttackLogic');

module.exports = {
    hasTarget: CommonAttackLogic.hasTarget,
    getAttackCost: CommonAttackLogic.getAttackCost,
    getAttackNodes: CommonAttackLogic.getAttackNodes,
    attacks:
    {
        shortbow: require('./attacks/shortBowAttackLogic'),
        onehanded: require('./attacks/strikeAttackLogic')
    }
};
