function DualKeyHash()
{
    this.hash = {};

    this.add = function (key1, key2, obj)
    {
        if (!this.hash[key1])
            this.hash[key1] = {};

        this.hash[key1][key2] = obj;
    };

    this.get = function (key1, key2)
    {
        return this.hash[key1] && this.hash[key1][key2];
    };

    this.remove = function (key1, key2)
    {
        if (this.hash[key1])
            delete this.hash[key1][key2];
    };

    this.toArray = function ()
    {
        var items = [];
        for (var key1 in this.hash)
        {
            for (var key2 in this.hash[key1])
                items.push(this.hash[key1][key2]);
        }

        return items;
    };
}

module.exports = DualKeyHash;