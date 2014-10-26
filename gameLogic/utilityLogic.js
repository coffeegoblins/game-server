module.exports = {
    nextRandom: function (game, min, max)
    {
        max = max || 1;
        min = min || 0;

        game.seed = (game.seed * 9301 + 49297) % 233280;
        var randomNumber = game.seed / 233280.0;

        return min + randomNumber * (max - min);
    }
};
