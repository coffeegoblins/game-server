define([],
    function ()
    {
        'use strict';

        return {
            createContentDiv: function ()
            {
                this.contentDiv = document.createElement('div');
                this.contentDiv.id = 'content';
                document.body.appendChild(this.contentDiv);

                return this.contentDiv;
            },

            hide: function (parentElement)
            {
                while (parentElement.lastChild)
                {
                    parentElement.removeChild(parentElement.lastChild);
                }
            }
        };
    });
