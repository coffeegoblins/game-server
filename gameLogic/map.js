function Map(tiles, boundaries)
{
    this.tiles = tiles;
    this.width = boundaries.width;
    this.height = boundaries.height;
}

Map.prototype.getTile = function (x, y)
{
    if (x < 0 || y < 0 || x > this.width - 1 || y > this.height - 1)
        return;

    return this.tiles[x + y * this.width];
};

module.exports = Map;
