define(['text!./battleConfiguration.html', 'core/src/events', 'core/src/utility'], function (Template, Events, Utility)
{
    'use strict';

    function BattleConfiguration()
    {
        this.levels = {
            level1: {minUnits: 4, maxUnits: 4},
            level2: {minUnits: 4, maxUnits: 4},
            level3: {minUnits: 4, maxUnits: 4}
        };

        var battleConfig = window.localStorage.getItem('battleConfig');
        this.config = battleConfig ? JSON.parse(battleConfig) : {};
    }

    BattleConfiguration.prototype.hide = function ()
    {
        var content = document.getElementById('content');
        while (content.lastChild)
            content.removeChild(content.lastChild);
    };

    BattleConfiguration.prototype.show = function ()
    {
        var contentElement = document.getElementById('content');
        Utility.insertTemplate(contentElement, Template);

        this.element = contentElement.querySelector('.battle-config');
        this.addButton = contentElement.querySelector('[data-button="add"');
        this.removeButton = contentElement.querySelector('[data-button="remove"');
        this.confirmButton = contentElement.querySelector('[data-button="confirm"');

        this.addButton.addEventListener('click', this.onAddUnit.bind(this, 1), false);
        this.confirmButton.addEventListener('click', this.onConfirm.bind(this), false);
        this.removeButton.addEventListener('click', this.onAddUnit.bind(this, -1), false);

        this.turnSlider = contentElement.querySelector('#turn-slider');
        this.unitSlider = contentElement.querySelector('#unit-slider');
        this.levelSelect = contentElement.querySelector('#level-select');

        this.turnSlider.addEventListener('input', this.onTurnCountChanged.bind(this), false);
        this.turnSlider.addEventListener('change', this.onTurnCountChanged.bind(this), false);
        this.unitSlider.addEventListener('input', this.onUnitCountChanged.bind(this), false);
        this.unitSlider.addEventListener('change', this.onUnitCountChanged.bind(this), false);
        this.levelSelect.addEventListener('change', this.onLevelChanged.bind(this), false);

        contentElement.querySelector('.tab-header').on('click', '.tab-header-content', this.onTabClick.bind(this));
        contentElement.querySelector('[data-button="cancel"').addEventListener('click', this.onCancel.bind(this), false);

        this.onTurnCountChanged();
        this.populateLevelSelect();

        this.selectTab(contentElement.querySelector('.tab[data-unit="shield"]'));
        return this;
    };


    BattleConfiguration.prototype.onAddUnit = function (amount, e)
    {
        if (e.target.classList.contains('disabled'))
            return;

        var levelConfig = this.config[this.levelName];
        var unitTypeCount = levelConfig.units[this.selectedUnit.type] + amount;
        levelConfig.units[this.selectedUnit.type] = unitTypeCount;
        levelConfig.unitCount += amount;

        if (levelConfig.unitCount >= this.level.maxUnits)
            this.addButton.classList.add('disabled');
        else
            this.addButton.classList.remove('disabled');

        if (unitTypeCount === 0)
            this.removeButton.classList.add('disabled');
        else
            this.removeButton.classList.remove('disabled');

        this.confirmButton.disabled = (levelConfig.unitCount < this.level.minUnits);
        this.selectedUnit.tab.querySelector('.unit-count').textContent = unitTypeCount || '';
    };

    BattleConfiguration.prototype.onCancel = function ()
    {
        window.localStorage.setItem('battleConfig', JSON.stringify(this.config));
        this.trigger('cancel');
    };

    BattleConfiguration.prototype.onConfirm = function ()
    {
        window.localStorage.setItem('battleConfig', JSON.stringify(this.config));
        this.trigger('confirm', this.levelName, this.config[this.levelName].units);
    };

    BattleConfiguration.prototype.onLevelChanged = function ()
    {
        this.levelName = this.levelSelect.value;
        this.level = this.levels[this.levelName];

        if (!this.config[this.levelName])
        {
            this.config[this.levelName] = {
                units: {shield: 0, warrior: 0, archer: 0, rogue: 0},
                unitCount: 0
            };
        }

        this.unitSlider.min = this.level.minUnits;
        this.unitSlider.max = this.level.maxUnits;
        this.unitSlider.disabled = (this.level.minUnits === this.level.maxUnits);
        this.onUnitCountChanged();

        var levelConfig = this.config[this.levelName];
        for (var unitName in levelConfig.units)
        {
            var unitCountElement = this.element.querySelector('.tab[data-unit="' + unitName + '"] .unit-count');
            unitCountElement.textContent = levelConfig.units[unitName] || '';
        }

        this.confirmButton.disabled = (levelConfig.unitCount < this.level.minUnits);
        if (levelConfig.unitCount >= this.level.maxUnits)
            this.addButton.classList.add('disabled');
        else
            this.addButton.classList.remove('disabled');

        if (this.selectedUnit)
        {
            if (levelConfig[this.selectedUnit.type] === 0)
                this.removeButton.classList.add('disabled');
            else
                this.removeButton.classList.remove('disabled');
        }
    };

    BattleConfiguration.prototype.onTabClick = function (e)
    {
        var tabElement = Utility.findParentElement(e.target, '.tab');
        if (!tabElement.classList.contains('selected'))
            this.selectTab(tabElement);
    };

    BattleConfiguration.prototype.onTurnCountChanged = function ()
    {
        var turnCount = this.turnSlider.value;
        if (turnCount === this.turnSlider.max)
            turnCount = '\u221e';

        this.turnSlider.nextSibling.textContent = turnCount;
    };

    BattleConfiguration.prototype.onUnitCountChanged = function ()
    {
        this.unitSlider.nextSibling.textContent = this.unitSlider.value;
    };

    BattleConfiguration.prototype.populateLevelSelect = function ()
    {
        var levels = Object.keys(this.levels);
        levels.sort();

        for (var i = 0; i < levels.length; i++)
        {
            var option = document.createElement('option');
            option.text = levels[i];
            this.levelSelect.add(option);
        }

        this.onLevelChanged();
    };

    BattleConfiguration.prototype.selectTab = function (tabElement)
    {
        if (this.selectedUnit)
        {
            this.selectedUnit.tab.classList.remove('selected');
            this.selectedUnit.content.classList.remove('selected');
        }

        var unitType = tabElement.getAttribute('data-unit');
        var contentElement = this.element.querySelector('.tab-content[data-unit="' + unitType + '"]');

        tabElement.classList.add('selected');
        contentElement.classList.add('selected');
        this.selectedUnit = {tab: tabElement, content: contentElement, type: unitType};

        if (this.config[this.levelName].units[unitType] === 0)
            this.removeButton.classList.add('disabled');
        else
            this.removeButton.classList.remove('disabled');
    };

    Events.register(BattleConfiguration.prototype);
    return BattleConfiguration;
});
