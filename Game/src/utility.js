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
        for (var i = 0; i < array.length; i++)
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
        for (var i = 0; i < array.length; i++)
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
        for (var i = 0; i < array.length; i++)
        {
            if (array[i][property] === value)
            {
                return array[i];
            }
        }
    };

    Utility.getElementByProperties = function (array, properties)
    {
        for (var i = 0; i < array.length; i++)
        {
            var isMatching = true;
            for (var property in properties)
            {
                if (properties.hasOwnProperty(property) && array[i][property] !== properties[property])
                {
                    isMatching = false;
                    break;
                }
            }

            if (isMatching)
            {
                return array[i];
            }
        }
    };

    /**
     * Removes an element from the given array
     * @param array
     * @param element
     */
    Utility.removeElement = function (array, element)
    {
        var index = array.indexOf(element);
        if (index >= 0)
        {
            array.splice(index, 1);
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
        for (var i = 0; i < array.length; i++)
        {
            var object = array[i];
            if (object[property] === value)
            {
                array.splice(i, 1);
                return object;
            }
        }
    };

    Utility.removeElementByProperties = function (array, properties)
    {
        for (var i = 0; i < array.length; i++)
        {
            var isMatching = true;
            for (var property in properties)
            {
                if (properties.hasOwnProperty(property) && array[i][property] !== properties[property])
                {
                    isMatching = false;
                    break;
                }
            }

            if (isMatching)
                return array.splice(i, 1)[0];
        }
    };

    return Utility;
});