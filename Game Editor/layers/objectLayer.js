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
        this.propertiesSection.setObject(this.properties);

        this.initialize();
    }

    ObjectLayer.prototype.createObject = function (key, ObjectType, position)
    {
        var obj = new ObjectType();
        if (obj.initialize)
            obj.initialize(position.x, position.y);

        if (!obj.rect)
        {
            obj.rect = {
                x: Math.floor(position.x),
                y: Math.floor(position.y),
                width: obj.width || 64,
                height: obj.height || 64
            };
        }

        obj.typeName = key;
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
        {
            var item = this.selectedItems[i];
            var x = Math.floor((item.rect.x - viewport.rect.left) * viewport.scale);
            var y = Math.floor((item.rect.y - viewport.rect.top) * viewport.scale);
            var width = Math.floor(item.rect.width * viewport.scale);
            var height = Math.floor(item.rect.height * viewport.scale);

            viewport.context.beginPath();
            viewport.context.rect(x, y, width, height);
            viewport.context.stroke();
        }
    };

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
            var objectTypes = Editor.Plugins.objectTypes;
            if (!objectTypes || Utility.isObjectEmpty(objectTypes))
                return;

            this.popup = new Editor.Popup(objectTypes).show(e.pageX, e.pageY);
            this.popup.on('close', this, function () { this.popup = null; }.bind(this));
            this.popup.on('itemClick', this, function (key, objectType)
            {
                this.createObject(key, objectType, position);
            }.bind(this));
        }
    };

    ObjectLayer.prototype.onKeyDown = function (e)
    {
        if (e.keyCode === 46)
        {
            for (var i = 0; i < this.selectedItems.length; i++)
                Utility.remove(this.objects, this.selectedItems[i]);

            this.selectItems();
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
        {
            var item = this.selectedItems[0];
            this.propertiesSection.setConfig(item.getPropertyConfig && item.getPropertyConfig());
            this.propertiesSection.setObject(item);
        }
        else if (!this.selectedItems.length)
        {
            this.propertiesSection.setConfig();
            this.propertiesSection.setObject(this.properties);
        }
    };


    ObjectLayer.prototype.deserialize = function (data)
    {
        if (data.properties)
            this.properties = data.properties;

        var objectTypes = Editor.Plugins.objectTypes;
        for (var i = 0; i < data.objects.length; i++)
        {
            var objData = data.objects[i];
            var ObjectType = objectTypes[objData.typeName] || objectTypes.object;
            if (ObjectType)
            {
                var obj = new ObjectType();
                this.objects.push(obj);

                if (obj.deserialize)
                    obj.deserialize(objData);
                else
                    Utility.merge(obj, objData);
            }
        }

        this.selectItems();
    };

    ObjectLayer.prototype.serialize = function ()
    {
        var data = {objects: []};
        if (!Utility.isObjectEmpty(this.properties))
            data.properties = this.properties;

        for (var i = 0; i < this.objects.length; i++)
        {
            var obj = this.objects[i];
            if (obj.serialize)
                data.objects.push(obj.serialize());
            else
                data.objects.push(obj);
        }

        return data;
    };

    return ObjectLayer;
});