define(function ()
{
    'use strict';

    return {
        containsElement: function (array, element)
        {
            for (var i = 0; i < array.length; i++)
            {
                if (array[i] === element)
                {
                    return true;
                }
            }

            return false;
        },

        getElementByProperty: function (array, property, value)
        {
            for (var i = 0; i < array.length; i++)
            {
                if (array[i][property] === value)
                {
                    return array[i];
                }
            }
        },

        getElementByProperties: function (array, properties)
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
        },

        findParentElement: function (element, selector)
        {
            while (element && element.matches)
            {
                if (element.matches(selector))
                    return element;

                element = element.parentNode;
            }
        },

        insertTemplate: function (element, template)
        {
            element.insertAdjacentHTML('beforeend', template);
            this.removeWhitespace(element);
        },

        merge: function ()
        {
            var baseObject = arguments[0];
            for (var i = 1; i < arguments.length; i++)
            {
                var argument = arguments[i];
                if (argument)
                {
                    for (var property in argument)
                    {
                        if (argument[property] !== undefined)
                            baseObject[property] = argument[property];
                    }
                }
            }

            return baseObject;
        },

        removeElement: function (array, element)
        {
            var index = array.indexOf(element);
            if (index >= 0)
            {
                array.splice(index, 1);
            }
        },

        removeElementByProperty: function (array, property, value)
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
        },

        removeElementByProperties: function (array, properties)
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
        },

        removeWhitespace: function (element)
        {
            for (var i = element.childNodes.length - 1; i >= 0; i--)
            {
                var childNode = element.childNodes[i];
                if (childNode.nodeType === 3 && !/\S/.test(childNode.nodeValue))
                    element.removeChild(childNode);
                else if (childNode.nodeType === 1)
                    this.removeWhitespace(childNode);
            }
        },

        validateNumber: function (number)
        {
            return (number && isFinite(number)) ? number : 0;
        }
    };
});
