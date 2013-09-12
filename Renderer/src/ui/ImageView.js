define([], function ()
{
    'use strict';
    function ImageView(parentDiv, id, width, height, image)
    {
        this.parentDiv = parentDiv;

        this.img = document.createElement("img");
        this.img.id = id;
        this.img.src = image ? image.path : null;
        this.img.style.width = width + "%";
        this.img.style.height = height + "%";

        this.parentDiv.appendChild(this.img);
    }

    return ImageView;
});
