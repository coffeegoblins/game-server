function ValidationUtility()
{

}

ValidationUtility.prototype.isValid = function (type, value, callback)
{
    switch (type)
    {
        case 'STRING':
                callback(typeof value === 'string' || value instanceof String);
            break;
    }
};

module.exports = exports = new ValidationUtility();
