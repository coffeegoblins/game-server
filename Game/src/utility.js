define(function ()
{
    'use strict';
    function Utility() {}

    Utility.isTouchEnabled = function ()
    {
        return ('ontouchstart' in window) || ('onmsgesturechange' in window);
    };

    Utility.merge = function ()
    {
        var baseObject = arguments[0];
        for (var i = 1; i < arguments.length; i++)
        {
            var argument = arguments[i];
            if (argument)
            {
                for (var property in argument)
                    baseObject[property] = argument[property];
            }
        }

        return baseObject;
    };

    Utility.containsElement = function (array, element)
    {
        var elementCount = array.length;
        for (var i = 0; i < elementCount; i++)
        {
            if (array[i] === element)
            {
                return true;
            }
        }

        return false;
    };

    Utility.containsElementWithProperty = function (array, property, value)
    {
        var elementCount = array.length;
        for (var i = 0; i < elementCount; i++)
        {
            if (array[i][property] === value)
            {
                return true;
            }
        }

        return false;
    };

    Utility.getElementByProperty = function (array, property, value)
    {
        var elementCount = array.length;
        for (var i = 0; i < elementCount; i++)
        {
            if (array[i][property] === value)
            {
                return array[i];
            }
        }

        return null;
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