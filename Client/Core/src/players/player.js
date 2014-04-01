define(['text!../../content/soldierData.json', '../eventManager', '../pathManager', 'renderer', '../scheduler', '../soundManager', '../utility'],
    function (SoldierData, EventManager, PathManager, Renderer, Scheduler, SoundManager, Utility)
    {
        'use strict';
        var soldierData = JSON.parse(SoldierData);

        function Player(map, units, activeUnitView, renderableTurnQueue)
        {
            this.map = map;
            this.activeUnitView = activeUnitView;
            this.renderableTurnQueue = renderableTurnQueue;

            this.units = units || [];
            for (var i = 0; i < this.units.length; i++)
            {
                var soldier = this.units[i];
                soldier.player = this;
                soldier.on('death', this.onSoldierDeath.bind(this));
            }
        }

        Player.prototype.endTurn = function ()
        {
            this.unit = null;
            this.trigger('endTurn', this);
        };

        Player.prototype.calculateCrossNodes = function (selectedNode, availableNodes)
        {
            var crossNodes = [];
            for (var i = 0; i < availableNodes.length; ++i)
            {
                var node = availableNodes[i];

                if ((node.x === selectedNode.x && (node.y === selectedNode.y - 1 || node.y === selectedNode.y + 1)) ||
                    (node.y === selectedNode.y && (node.x === selectedNode.x - 1 || node.x === selectedNode.x + 1)))
                {
                    if (node.tile.unit !== this.unit)
                        crossNodes.push(node);
                }
            }

            return crossNodes;
        };

        Player.prototype.getAttacks = function ()
        {
            var attacks = [];
            var weapon = this.unit.weapon;
            var attackType = soldierData[weapon.type];

            for (var attackName in attackType)
            {
                var attack = Utility.merge({name: attackName}, attackType[attackName]);
                attack.totalDamage = attack.damage * weapon.damage;
                attacks.push(attack);
            }

            return attacks;
        };

        Player.prototype.getAttackRange = function (attackName)
        {
            switch (attackName)
            {
                case 'shield':
                case 'strike':
                    return Math.min(this.unit.weapon.range, PathManager.defaultMoveCost);

                case 'sweep':
                    return Math.min(this.unit.weapon.range, PathManager.diagonalMoveCost);

                case 'shortShot':
                    return this.unit.weapon.range / 2;

                case 'longShot':
                    return this.unit.weapon.range;
            }
        };

        Player.prototype.moveUnit = function (tiles, cost)
        {
            this.unit.setState('run');
            Renderer.camera.trackUnit(this.unit);
            this.activeUnitView.apBar.disableTransitions();

            var startTile = this.map.getTile(this.unit.tileX, this.unit.tileY);
            startTile.unit = null;

            var startAp = this.unit.ap;
            var endAp = startAp - cost;
            var totalTime = cost / 35;

            var path = tiles.slice();
            path.unshift({x: this.unit.tileX, y: this.unit.tileY});

            var progressTime = 0;
            var progressPercentage = 0;

            for (var i = 1; i < path.length; i++)
            {
                var node = path[i];
                node.startPercentage = progressPercentage;
                node.endPercentage = node.distance / cost;
                node.percentageShare = node.endPercentage - node.startPercentage;
                progressPercentage = node.endPercentage;
            }

            var currentNode = path.shift();
            var nextNode = path.shift();

            Scheduler.schedule({
                context: this,
                endTime: totalTime,
                method: function (e, deltaTime)
                {
                    progressTime += deltaTime;
                    var progressPercentage = progressTime / totalTime;
                    while (progressPercentage > nextNode.endPercentage)
                    {
                        currentNode = nextNode;
                        nextNode = path.shift();
                    }

                    var deltaX = nextNode.x - currentNode.x;
                    var deltaY = nextNode.y - currentNode.y;
                    this.unit.setDirection(deltaX, deltaY);

                    var nodeProgressPercentage = (progressPercentage - nextNode.startPercentage) / nextNode.percentageShare;
                    this.unit.tileX = currentNode.x + (deltaX * nodeProgressPercentage);
                    this.unit.tileY = currentNode.y + (deltaY * nodeProgressPercentage);

                    this.unit.ap = startAp + (endAp - startAp) * progressPercentage;
                    this.activeUnitView.updateValues();
                },
                completedMethod: function ()
                {
                    this.unit.tileX = nextNode.x;
                    this.unit.tileY = nextNode.y;
                    nextNode.tile.unit = this.unit;

                    this.unit.ap = endAp;
                    this.unit.setState('idle');
                    this.activeUnitView.apBar.enableTransitions();
                    this.activeUnitView.updateValues();

                    Renderer.camera.trackUnit();
                    this.onMoveComplete();
                }
            });
        };

        Player.prototype.onSoldierDeath = function (soldier)
        {
            Utility.removeElement(this.units, soldier);
            if (!this.units.length)
                this.trigger('defeat', this);
        };

        Player.prototype.performAttack = function (targetTile, affectedTiles, attack)
        {
            var deltaX = targetTile.x - this.unit.tileX;
            var deltaY = targetTile.y - this.unit.tileY;

            this.unit.ap -= attack.cost;
            this.unit.setDirection(deltaX, deltaY);
            this.unit.setState('attack');

            SoundManager.playTrack(attack.track);

            this.unit.on('animationComplete', this, function onAttackFinished()
            {
                for (var i = 0; i < affectedTiles.length; ++i)
                {
                    var node = affectedTiles[i];
                    if (node.tile.unit)
                        node.tile.unit.damage(attack.totalDamage);
                }

                this.unit.setState('idle');
                this.unit.off('animationComplete', this, onAttackFinished);
                this.onAttackComplete();
            });
        };

        Player.prototype.performTurn = function (unit)
        {
            this.unit = unit;
        };

        EventManager.register(Player.prototype);
        return Player;
    });