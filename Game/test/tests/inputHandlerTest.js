define(['Game/src/inputHandler', 'Game/src/scheduler'], function (InputHandler, Scheduler)
{
    'use strict';

    function InputHandlerTest()
    {
        this.name = 'Input Handler Test';
    }

    InputHandlerTest.prototype.setup = function ()
    {
        this.canvas = document.getElementById('canvas');
        this.inputHandler = InputHandler.getInstance();
        this.inputState = this.inputHandler.InputState;

        this.mouseEvent = document.createEvent('MouseEvents');
    };

    InputHandlerTest.prototype.testPressEventStopsInputFlick = function ()
    {
        var methodCalled;

        Scheduler.schedule({id: 'flick', context: this, method: function ()
        {
            methodCalled = true;
        }});

        var mouseEvent = this.inputHandler.handlePressEvent();

        assertTruthy("Mouse event is null.", mouseEvent);
        assertTruthy("Msg Status is incorrect.", mouseEvent.state === this.inputState.DOWN);

        asyncWait(100);
        async(function ()
        {
            assertFalsy(methodCalled);
        });
    };

    InputHandlerTest.prototype.testDragEventsAreTrackedAndRemoved = function ()
    {
        var moveEvent = { currentEvent: { pageX: 0, pageY: 0 }, state: this.inputState.DRAGGING, dragEvents: [
            {id: '1', currentTime: 0},
            {id: '2', currentTime: new Date().getTime()}
        ] };
        var currentEvent = { pageX: 10, pageY: 10 };

        this.inputHandler.handleMoveEvent(moveEvent, currentEvent);

        var foundExpired = false;
        var foundExpected = false;

        for (var i = 0; i < moveEvent.dragEvents.length; ++i)
        {
            var dragEvent = moveEvent.dragEvents[i];

            if (dragEvent.id === '1')
                foundExpired = true;

            if (dragEvent.id === '2')
                foundExpected = true;
        }

        assertFalsy('The first event should have been deleted.', foundExpired);
        assertTruthy('The second event should not have been deleted.', foundExpected);
    };

    InputHandlerTest.prototype.testReleaseWhileDraggingStartsFlick = function ()
    {
        var releaseEvent = {
            state: this.inputHandler.InputState.DRAGGING,
            dragEvents: [{pageX: 0, pageY: 0}, {pageX: 1, pageY: 1}, {pageX: 2, pageY: 4}],
            currentEvent: {pageX: 0, pageY: 0}
        };

        this.inputHandler.handleReleaseEvent(releaseEvent);

        assertTruthy('The input state should be flicking.', releaseEvent.state === this.inputHandler.InputState.FLICKING);
        assertTruthy('Flick event is null.', this.inputHandler.flickEvent);
        assertTruthy('Incorrect velocity was calculated.', this.inputHandler.flickEvent.velocityX === -1);
        assertTruthy('Incorrect velocity was calculated.', this.inputHandler.flickEvent.velocityY === -2);
    };

    InputHandlerTest.prototype.testZeroVelocityDoesntFlick = function ()
    {
        var releaseEvent = {
            state: this.inputHandler.InputState.DRAGGING,
            dragEvents: [{pageX: 0, pageY: 0}, {pageX: 0, pageY: 0}, {pageX: 0, pageY: 0}],
            currentEvent: {pageX: 0, pageY: 0}
        };

        this.inputHandler.handleReleaseEvent(releaseEvent);

        assertTruthy('The input state should be flicking.', releaseEvent.state !== this.inputHandler.InputState.FLICKING);
    };

    InputHandlerTest.prototype.testFlickIsFinite = function ()
    {
        var flickCompleted = false;

        this.inputHandler.flickEvent = {currentX: 0, currentY: 0, velocityX: 1, velocityY: 1};

        this.inputHandler.flick(null, null);

        assertFalsy('Flick event is still active', this.inputHandler.flickEvent);
    };

    return InputHandlerTest;
});