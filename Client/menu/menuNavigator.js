define([],
    function ()
    {
        'use strict';

        return {
            createContentDiv: function ()
            {
                this.contentDiv = document.createElement('div');
                this.contentDiv.id = 'contentWrapper';
                document.body.appendChild(this.contentDiv);

                return this.contentDiv;
            },

            removeChildren: function (parentElement)
            {
                while (parentElement.lastChild)
                {
                    parentElement.removeChild(parentElement.lastChild);
                }
            }
        };
    });
