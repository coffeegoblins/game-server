define(['Game/src/inputHandler', 'text!Game/content/sampleInterface.html'], function (InputHandler, SampleInterfaceView)
{
    'use strict';
    function SampleInterface()
    {
        var test = document.createElement('div');
        test.innerHTML = SampleInterfaceView;
        document.body.appendChild(test.firstChild);

        var outputFunction = function () { console.log(this.id); };
        InputHandler.registerEvent('testButton1', outputFunction);
        InputHandler.registerEvent('testButton2', outputFunction);
        InputHandler.registerEvent('testButton3', outputFunction);
    }

    return SampleInterface;
});
