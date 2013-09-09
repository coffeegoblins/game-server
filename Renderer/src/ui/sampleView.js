define(['Game/src/inputHandler', 'text!Renderer/content/sampleView.html'], function (InputHandler, SampleViewText)
{
    'use strict';
    function SampleView()
    {
        var test = document.createElement('div');
        test.innerHTML = SampleViewText;
        document.body.appendChild(test.firstChild);

        var outputFunction = function () { console.log(this.id); };
        InputHandler.registerEvent('testButton1', outputFunction);
        InputHandler.registerEvent('testButton2', outputFunction);
        InputHandler.registerEvent('testButton3', outputFunction);
    }

    return SampleView;
});
