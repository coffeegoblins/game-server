define([
        'renderer/src/renderer',
        './scheduler',
        './inputHandler',
        './browserNavigation',
        './turnManager',
        './soldier',
        './players/automatedPlayer',
        './players/localPlayer',
        './players/remotePlayer'
    ],
    function (Renderer, Scheduler, InputHandler, BrowserNavigation, TurnManager, Soldier, AutomatedPlayer, LocalPlayer, RemotePlayer)
    {
        'use strict';

        function createSoldiers(positions, unitTypes)
        {
            var soldiers = [];
            var positionIndex = 0;
            for (var unitType in unitTypes)
            {
                for (var i = 0; i < unitTypes[unitType]; i++)
                {
                    var position = positions[positionIndex++];
                    soldiers.push(new Soldier({
                        tileX: position.x,
                        tileY: position.y,
                        type: unitType
                    }));
                }
            }

            return soldiers;
        }

        return {
            loadLevel: function (socket, unitLogic, levelData, users)
            {
                Scheduler.clear();
                Renderer.initialize();
                BrowserNavigation.on('leaving:singlePlayer', this, this.uninitialize);

                this.players = [];
                this.socket = socket;
                this.currentMap = levelData.map;
                this.turnManager = new TurnManager();
                Renderer.addRenderableMap(this.currentMap);

                for (var i = 0; i < levelData.objects.length; i++)
                {
                    var obj = levelData.objects[i];
                    levelData.map.addObject(obj, obj.x, obj.y);
                    Renderer.addRenderableObject(obj);
                }

                var soldiers;
                var currentUsername = this.socket.user.username;
                for (i = 0; i < users.length; i++)
                {
                    var user = users[i];
                    if (user.username === currentUsername)
                    {
                        soldiers = createSoldiers(levelData.player1Positions, user.units);
                        this.players.push(new LocalPlayer(unitLogic, this.currentMap, soldiers));
                    }
                    else
                    {
                        soldiers = createSoldiers(levelData.player2Positions, user.units);
                        this.players.push(new RemotePlayer(unitLogic, this.currentMap, soldiers));
                    }
                }

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
                        {
                            unit.statusPanel.updateValues();
                        }
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
                console.log('player ' + player.name + ' defeated');
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
