define([
        'renderer/src/renderer',
        './scheduler',
        './inputHandler',
        './browserNavigation',
        './levelLoader',
        './turnManager',
        './soldier',
        './players/automatedPlayer',
        './players/localPlayer',
        './players/remotePlayer'
    ],
    function (Renderer, Scheduler, InputHandler, BrowserNavigation, LevelLoader, TurnManager, Soldier, AutomatedPlayer, LocalPlayer, RemotePlayer)
    {
        'use strict';

        function createSoldiers(positions)
        {
            var types = ['swordAndShield', 'archer', 'dualWield', 'twoHanded'];

            var soldiers = [];
            for (var i = 0; i < positions.length; i++)
            {
                var position = positions[i];
                var soldier = new Soldier({
                    name: 'Unit ' + (i + 1),
                    tileX: position.x,
                    tileY: position.y,
                    type: types[i % 4]
                });

                soldiers.push(soldier);
            }

            return soldiers;
        }

        return {
            loadLevel: function (levelName)
            {
                Scheduler.clear();
                Renderer.initialize();
                BrowserNavigation.on('leaving:singlePlayer', this, this.uninitialize);

                this.turnManager = new TurnManager();
                this.turnManager.on('beginTurn', this, this.onBeginTurn);
                this.turnManager.on('endTurn', this, this.onEndTurn);

                LevelLoader.loadLevel(levelName, function (map, startPoints)
                {
                    this.currentMap = map;
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
                        new LocalPlayer(this.currentMap, createSoldiers(player1Positions)),
                        new AutomatedPlayer(this.currentMap, createSoldiers(player2Positions))
                    ];

                    for (i = 0; i < this.players.length; i++)
                    {
                        var player = this.players[i];
                        player.on('defeat', this, this.onPlayerDefeat);
                        player.on('endTurn', this, this.onEndTurnAction);

                        for (var j = 0; j < player.units.length; j++)
                        {
                            var unit = player.units[j];
                            this.turnManager.addUnit(unit);
                            Renderer.addRenderableSoldier(unit);
                            this.currentMap.addUnit(unit, unit.tileX, unit.tileY);
                        }
                    }

                    InputHandler.disableInput();
                    this.turnManager.beginTurn();
                }.bind(this));
            },

            onBeginTurn: function (unit)
            {
                unit.isSelected = true;
                Renderer.camera.moveToUnit(unit, this.onCameraMoved.bind(this));

                // Update all the turn numbers
                for (var i = 0; i < this.players.length; i++)
                {
                    var player = this.players[i];
                    for (var j = 0; j < player.units.length; j++)
                    {
                        unit = player.units[j];
                        if (unit.statusPanel)
                            unit.statusPanel.updateValues();
                    }
                }
            },

            onCameraMoved: function (unit)
            {
                unit.player.performTurn(unit);
            },

            onEndTurn: function (unit)
            {
                unit.isSelected = false;
                Renderer.clearRenderablePaths();
                this.turnManager.beginTurn();
            },

            onEndTurnAction: function ()
            {
                this.turnManager.endTurn();
            },

            onPlayerDefeat: function (player)
            {
                console.log('player defeated');
            },

            uninitialize: function ()
            {
                Scheduler.clear();
                Renderer.uninitialize();
                InputHandler.disableInput();
                BrowserNavigation.off('leaving:singlePlayer', this);
            }
        };
    });
