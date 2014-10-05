var assert = require('assert');
var TestUtility = require('../testUtility');

module.exports.appliesCombatLockTest = function ()
{
    it('Should apply combat lock', function ()
    {
        var targetUnit = this.targetNode.tile.unit;

        this.attackLogic.performAttack(this.attackingUnit, this.targetNode);

        assert.equal(this.attackingUnit, targetUnit.target, "The target unit is not in combat lock.");
        assert.equal(targetUnit, this.attackingUnit.target, "The attacking unit is not in combat lock.");
    });
};

module.exports.doesNotApplyCombatLock = function ()
{
    it('Should not apply a combat lock', function ()
    {
        var targetUnit = this.targetNode.tile.unit;
        targetUnit.target = null;

        this.attackLogic.performAttack(this.attackingUnit, this.targetNode);

        assert.notEqual(targetUnit, this.attackingUnit.target, "The attacking unit is not in combat lock.");
    });
};

module.exports.performAttackTests = function ()
{
    it('Should apply damage', function ()
    {
        var targetNodes = this.attackLogic.getTargetNodes(this.targetNode);
        var startHPs = {};

        for (var i = 0; i < targetNodes.length; ++i)
        {
            targetNodes[i].occlusionPercentage = 0;

            var unit = targetNodes[i].tile.unit;
            if (unit)
            {
                startHPs[unit._id] = unit.hp;
                ensurePerfectAccuracy(this.attackLogic, unit.type);
            }
        }

        var results = this.attackLogic.performAttack(this.attackingUnit, this.targetNode);

        for (i = 0; i < results.length; ++i)
        {
            var resultUnit = results[i].unit;
            var damage = results[i].damage;

            assert.notEqual(0, damage, "A unit did not take damage.");
            assert.notEqual(startHPs[resultUnit._id], resultUnit.hp, "A unit did not take damage.");
            assert.equal(startHPs[resultUnit._id] - damage, resultUnit.hp, "The target unit did not take damage.");
        }
    });
};

module.exports.occlusionTests = function ()
{
    it('Should occlude tiles', function ()
    {
        var attackNodes = this.attackLogic.getAttackNodes(this.map, this.attackingUnit);

        assert.notEqual(null, attackNodes[0].occlusionPercentage, "The tiles were not occluded.");
    });

    it('Should reduce accuracy for occlusion', function ()
    {
        var targetUnit = this.targetNode.tile.unit;
        var startHP = targetUnit.hp;

        ensurePerfectAccuracy(this.attackLogic, targetUnit.type);

        this.attackLogic.performAttack(this.attackingUnit, this.targetNode);

        assert.equal(startHP, targetUnit.hp, "The target unit took damage.");
    });
};

function ensurePerfectAccuracy(attackLogic, targetUnitType)
{
    Math.random = function ()
    {
        // Make random not so random (set to always hit)
        return isNaN(attackLogic.accuracy) ? attackLogic.accuracy[targetUnitType] : attackLogic.accuracy;
    };
}

//
//it('Should update map if unit dies', function () {
//
//});
//
//it('Should update unit list if unit dies', function () {
//
//});
//

//    it('Should break existing combat lock',
// function ()
//    {
//        var combatLockedUnit = TestUtility.createUnit(
//        {
//            target: attackingUnit,
//            x: 2
//        });
//
//        units.push(combatLockedUnit);
//
//        attackingUnit.target = combatLockedUnit;
//
//        AttackPerformer.perform(units, map, attackAction);
//
//        assert.equal(true, attackingUnit.target !== combatLockedUnit, 'The combat lock was not broken.');
//    });
