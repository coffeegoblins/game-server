define(['Editor', 'text!../templates/objectLayerPanel.html'], function (Editor, Template)
{
    'use strict';
    function ObjectLayer()
    {
        this.name = "Object Layer";
        this.objects = [];
        this.selectedItems = [];
        this.properties = {};

        this.elements = Utility.getElementFromTemplate(Template);
        this.propertiesSection = new Editor.PropertiesSection();
        this.propertiesSection.setConfig({exclusions: {typeName: true}});
        this.propertiesSection.setObject(this.properties);

        this.initialize();

        if (!Editor.Plugins.objectTypes)
            Editor.Plugins.objectTypes = [];

        var objectTypes = Editor.Plugins.objectTypes;
        objectTypes.sort(function (obj1, obj2)
        {
            return (obj1.type < obj2.type) ? -1 : (obj1.type > obj2.type) ? 1 : 0;
        });
    }

    ObjectLayer.prototype.createObject = function (ObjectType, position)
    {
        var obj = new ObjectType();
        obj.rect = {x: Math.floor(position.x), y: Math.floor(position.y), width: obj.width || 64, height: obj.height || 64};
        obj.typeName = ObjectType.type;

        this.objects.push(obj);
    };

    ObjectLayer.prototype.draw = function (viewport)
    {
        for (var i = 0; i < this.objects.length; i++)
        {
            var obj = this.objects[i];
            if (obj.draw)
                obj.draw(viewport);
        }

        viewport.context.strokeStyle = '#99d2ff';
        for (i = 0; i < this.selectedItems.length; i++)
            drawRectangle(viewport, this.selectedItems[i]);
    };

    function drawRectangle(viewport, obj)
    {
        var x = Math.floor((obj.rect.x - viewport.rect.left) * viewport.scale);
        var y = Math.floor((obj.rect.y - viewport.rect.top) * viewport.scale);
        var width = Math.floor(obj.rect.width * viewport.scale);
        var height = Math.floor(obj.rect.height * viewport.scale);

        viewport.context.beginPath();
        viewport.context.rect(x, y, width, height);
        viewport.context.stroke();
    }

    ObjectLayer.prototype.getPanel = function ()
    {
        return this.elements;
    };

    ObjectLayer.prototype.initialize = function ()
    {
        var contentElement = this.elements[1];
        contentElement.insertBefore(this.propertiesSection.element, contentElement.firstChild);
        this.elements[0].querySelector('.add-icon').addEventListener('click', this.propertiesSection.addNewProperty.bind(this.propertiesSection), false);
    };

    ObjectLayer.prototype.onClick = function (e, Viewport)
    {
        var position = Viewport.fromScreen(e.pageX, e.pageY);
        if (e.which === 1)
        {
            var selectedObj;
            for (var i = 0; i < this.objects.length; i++)
            {
                var obj = this.objects[i];
                if (position.x >= obj.rect.x && position.y >= obj.rect.y &&
                    position.x <= obj.rect.x + obj.rect.width &&
                    position.y <= obj.rect.y + obj.rect.height)
                {
                    selectedObj = obj;
                    break;
                }
            }

            this.selectItems(selectedObj);
        }
        else if (e.which === 3)
        {
            this.popup = new Editor.Popup(Editor.Plugins.objectTypes, 'type').show(e.pageX, e.pageY);
            this.popup.on('close', this, function () { this.popup = null; }.bind(this));
            this.popup.on('itemClick', this, function (objectType)
            {
                this.createObject(objectType, position);
            }.bind(this));
        }
    };

    ObjectLayer.prototype.selectItems = function (items)
    {
        this.selectedItems.length = 0;
        this.propertiesSection.clear();

        if (items)
        {
            if (Array.isArray(items))
                this.selectedItems.push.apply(this.selectedItems, items);
            else
                this.selectedItems.push(items);
        }

        if (this.selectedItems.length === 1)
            this.propertiesSection.setObject(this.selectedItems[0]);
        else if (!this.selectedItems.length)
            this.propertiesSection.setObject(this.properties);
    };


    ObjectLayer.prototype.deserialize = function (data)
    {
        if (data.properties)
            this.properties = data.properties;

        var objectTypes = {};
        for (var i = 0; i < Editor.Plugins.objectTypes.length; i++)
        {
            var objType = Editor.Plugins.objectTypes[i];
            objectTypes[objType.type] = objType;
        }

        for (i = 0; i < data.objects.length; i++)
        {
            var obj = data.objects[i];
            if (!obj.typeName)
                obj.typeName = 'object';

            var ObjectType = objectTypes[obj.typeName] || objectTypes.object;
            this.objects.push(Utility.merge(new ObjectType(), obj));
        }

        this.selectItems();
    };

    ObjectLayer.prototype.serialize = function ()
    {
        var data = {objects: this.objects};
        if (!Utility.isObjectEmpty(this.properties))
            data.properties = this.properties;

        return data;
    };


    ObjectLayer.type = 'ObjectLayer';
    return ObjectLayer;
});