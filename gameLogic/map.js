function Map(tiles, units, boundaries)
{
    this.tiles = tiles;
    this.width = boundaries.width;
    this.height = boundaries.height;

    for (var i = 0; i < units.length; ++i)
    {
        var unit = units[i];
        this.getTile(unit.x, unit.y).unit = unit;
    }
}

Map.prototype.getTile = function (x, y)
{
    if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
    {
        return;
    }

    return this.tiles[x + y * this.width];
};

module.exports = Map;
