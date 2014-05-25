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
            var types = ['archer', 'rogue', 'shield', 'sword'];

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
                        player.on('endTurn', this, this.endTurn);

                        for (var j = 0; j < player.units.length; j++)
                        {
                            var unit = player.units[j];
                            this.turnManager.addUnit(unit);
                            Renderer.addRenderableSoldier(unit);
                            this.currentMap.addUnit(unit, unit.tileX, unit.tileY);
                        }
                    }

                    InputHandler.disableInput();
                    this.beginTurn();
                }.bind(this));
            },

            beginTurn: function ()
            {
                this.turnManager.beginTurn();

                var unit = this.turnManager.activeUnit;
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

            endTurn: function ()
            {
                this.turnManager.activeUnit.isSelected = false;
                this.turnManager.endTurn();

                Renderer.clearRenderablePaths();
                this.beginTurn();
            },

            onCameraMoved: function (unit)
            {
                unit.player.performTurn(unit);
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
