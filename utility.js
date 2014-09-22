module.exports = {
    findInArray: function (array, searchCriteria)
    {
        for (var i = 0; i < array.length; i++)
        {
            if (this.containsProperties(array[i], searchCriteria))
            {
                return array[i];
            }
        }

        return null;
    },

    containsProperties: function (object, properties)
    {
        for (var property in properties)
        {
            if (properties.hasOwnProperty(property))
            {
                if (object[property] !== properties[property])
                {
                    return false;
                }
            }
        }

        return true;
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
    }
};
