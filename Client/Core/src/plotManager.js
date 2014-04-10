define([
        'renderer',
        'text!../content/weapons.json',
        './scheduler',
        './inputHandler',
        './browserNavigation',
        './levelLoader',
        './turnManager',
        './soldier',
        './players/automatedPlayer',
        './players/localPlayer',
        './players/remotePlayer',
        'Renderer/src/ui/unitView',
        'Renderer/src/ui/renderableTurnQueue'
    ],
    function (Renderer, WeaponData, Scheduler, InputHandler, BrowserNavigation, LevelLoader, TurnManager, Soldier, AutomatedPlayer, LocalPlayer, RemotePlayer, UnitView, RenderableTurnQueue)
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

                var soldier = new Soldier({
                    name: 'Unit ' + (i + 1),
                    tileX: position.x,
                    tileY: position.y,
                    weapon: weaponData[weaponName],
                    direction: position.direction

                });

                soldier.weapon.name = weaponName;
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
                    this.activeUnitView = new UnitView(document.querySelector('.unit-view'));
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
                        new LocalPlayer(this.currentMap, createSoldiers(player1Positions), this.activeUnitView, this.renderableTurnQueue),
                        new AutomatedPlayer(this.currentMap, createSoldiers(player2Positions), this.activeUnitView, this.renderableTurnQueue)
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
                            this.renderableTurnQueue.addUnit(unit);
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
                this.activeUnitView.show(unit);
                this.renderableTurnQueue.onBeginTurn(unit);
                Renderer.camera.moveToUnit(unit, this.onCameraMoved.bind(this));
            },

            onCameraMoved: function (unit)
            {
                unit.player.performTurn(unit);
            },

            onEndTurn: function (unit, index)
            {
                unit.isSelected = false;
                this.activeUnitView.hide();
                this.renderableTurnQueue.onEndTurn(unit, index);
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