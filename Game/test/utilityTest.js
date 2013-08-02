require(["utility"], function (Utility)
{
    var UtilityTest = TestCase("UtilityTest");

    UtilityTest.prototype.setUp = function()
    {

    }

    UtilityTest.prototype.tearDown = function()
    {

    }

    UtilityTest.prototype.testRemoveElement = function()
    {
        var input = [1, 2];
        Utility.removeElement(input, 2);
        assertEquals(1, input.length);
    }
});