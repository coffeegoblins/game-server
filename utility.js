module.exports = {
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
