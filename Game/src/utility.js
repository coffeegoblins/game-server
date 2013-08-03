define([], function ()
{
    'use strict';
    function Utility() {}

    Utility.isTouchEnabled = function ()
    {
        return ('ontouchstart' in window) || ('onmsgesturechange' in window);
    };

    /**
     * Removes an element from the given array
     * @param array
     * @param element
     */
    Utility.removeElement = function (array, element)
    {
        var elementCount = array.length;
        for (var i = 0; i < elementCount; i++)
        {
            if (array[i] === element)
            {
                array.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Removes an element from an array with given property equal to the given value
     * @param array
     * @param property
     * @param value
     */
    Utility.removeElementByProperty = function (array, property, value)
    {
        var elementCount = array.length;
        for (var i = 0; i < elementCount; i++)
        {
            if (array[i][property] === value)
            {
                array.splice(i, 1);
                break;
            }
        }
    };

    return Utility;
});