define(['../connectionUtility', '../userTestUtility'], function (ConnectionUtility, UserTestUtility)
{
    'use strict';

    function UserManagerTest()
    {
        this.name = 'User Manager Test';
    }

    UserManagerTest.prototype.setup = function () {

    };

    UserManagerTest.prototype.tearDown = function ()
    {
        ConnectionUtility.disconnect();
    };

    UserManagerTest.prototype.testLoginPasswordMustMatch = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events)
        {
            UserTestUtility.createUser(socket, events, function (error, user)
            {
                socket.emit(events.login.name, user.username, user.password + "INVALID");

                socket.on(events.login.response.error, function (error)
                {
                    assertTruthy(error !== null);
                    testComplete = true;
                });
            });
        }.bind(this));

        async(function ()
        {
            return testComplete;
        }, 'The user did not fail to login.', 2000);
    };

    UserManagerTest.prototype.testLoginUserDoesNotExist = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events) {

        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testLoginSuccess = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events) {

        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testLoginEventsAreSubscribed = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events) {

        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testRegistrationUserAlreadyExists = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events) {

        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testRegistrationUserIsCreated = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events) {

        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testRegistrationEventsAreSubscribed = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket) {

        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    return UserManagerTest;
});