define([
        'renderer',
        'text!../content/weapons.json',
        './scheduler',
        './inputHandler',
        './levelLoader',
        './turnManager',
        './soldier',
        './players/automatedPlayer',
        './players/localPlayer',
        './players/remotePlayer',
        'Renderer/src/ui/activeUnitView',
        'Renderer/src/ui/renderableTurnQueue'
    ],
    function (Renderer, WeaponData, Scheduler, InputHandler, LevelLoader, TurnManager, Soldier, AutomatedPlayer, LocalPlayer, RemotePlayer, ActiveUnitView, RenderableTurnQueue)
    {
        'use strict';
        var weaponData = JSON.parse(WeaponData);

        function createSoldiers(positions)
        {
            var soldiers = [];
            for (var i = 0; i < positions.length; i++)
            {
                var position = positions[i];
                var weaponName;
                switch (i % 4)
                {
                    case 0:
                        weaponName = 'Bronze Sword and Shield';
                        break;

                    case 1:
                        weaponName = 'Short Bow';
                        break;

                    case 2:
                        weaponName = 'Twin Bronze Swords';
                        break;

                    case 3:
                        weaponName = 'Iron Longsword';
                        break;
                }

                var soldier = new Soldier({name: 'unit' + (i + 1), tileX: position.x, tileY: position.y, weapon: weaponData[weaponName]});
                soldier.weapon.name = weaponName;
                soldiers.push(soldier);
            }

            return soldiers;
        }

        return {
            loadLevel: function (levelName)
            {
                LevelLoader.loadLevel(levelName, function (map, startPoints)
                {
                    this.currentMap = map;
                    this.activeUnitView = new ActiveUnitView(document.getElementById('activeUnitView'));
                    this.renderableTurnQueue = new RenderableTurnQueue(document.getElementById('turnQueue'));

                    var player1Positions = [];
                    var player2Positions = [];

                    for (var i = 0; i < startPoints.length; i++)
                    {
                        var soldierPosition = startPoints[i];
                        if (soldierPosition.player === 'Player1')
                            player1Positions.push(soldierPosition);
                        else
                            player2Positions.push(soldierPosition);
                    }

                    this.players = [
                        new LocalPlayer(this.currentMap, createSoldiers(player1Positions), this.activeUnitView),
                        new AutomatedPlayer(this.currentMap, createSoldiers(player2Positions), this.activeUnitView)
                    ];

                    for (i = 0; i < this.players.length; i++)
                    {
                        var player = this.players[i];
                        player.on('defeat', this, this.onPlayerDefeat);
                        player.on('endTurn', this, this.onEndTurnAction);

                        for (var j = 0; j < player.units.length; j++)
                        {
                            var unit = player.units[j];
                            TurnManager.addUnit(unit);
                            Renderer.addRenderableSoldier(unit);
                            this.renderableTurnQueue.addUnit(unit);
                            this.currentMap.addUnit(unit, unit.tileX, unit.tileY);
                        }
                    }

                    TurnManager.on('beginTurn', this, this.onBeginTurn);
                    TurnManager.on('endTurn', this, this.onEndTurn);
                    TurnManager.beginTurn();
                }.bind(this));
            },

            onBeginTurn: function (unit)
            {
                this.activeUnitView.show(unit);
                this.renderableTurnQueue.onBeginTurn(unit);
                Renderer.camera.moveToUnit(unit, this, this.onCameraMoved);
            },

            onCameraMoved: function (unit)
            {
                unit.player.performTurn(unit);
                InputHandler.enableInput();
            },

            onEndTurn: function (unit, index)
            {
                InputHandler.disableInput();

                this.activeUnitView.hide();
                this.renderableTurnQueue.onEndTurn(unit, index);
                Renderer.clearRenderablePaths();

                TurnManager.beginTurn();
            },

            onEndTurnAction: function ()
            {
                TurnManager.endTurn();
            },

            onPlayerDefeat: function (player)
            {
                console.log('player defeated');
            }
        };
    });