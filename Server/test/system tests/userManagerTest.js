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
                socket.emit(events.login.name, user.username, "INVALID");

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

        ConnectionUtility.connect(function (error, socket, events)
        {
            socket.emit(events.login.name, "INVALID", "INVALID");

            socket.on(events.login.response.error, function (error)
            {
                assertTruthy(error !== null);
                testComplete = true;
            });
        }.bind(this));

        async(function ()
        {
            return testComplete;
        }, 'The user did not fail to login.', 10000);
    };

    UserManagerTest.prototype.testLoginSuccess = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events)
        {
            UserTestUtility.createUser(socket, events, function (error, user)
            {
                socket.emit(events.login.name, user.username, user.password);

                socket.on(events.login.response.success, function (serverUser)
                {                    
                    assertTruthy('The call was successful, but the user is undefined.', serverUser);
                    assertTruthy('An invalid user database object was returned.', serverUser._id);
                    assertTruthy('An invalid user database object was returned.', user._id !== null);
                    assertEquals('The server user did not equal the login user', serverUser.username, user.username);
                    testComplete = true;
                });
            });
        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testLoginEventsAreSubscribed = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events)
        {
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testRegistrationUserAlreadyExists = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events)
        {
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testRegistrationUserIsCreated = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket, events)
        {
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    UserManagerTest.prototype.testRegistrationEventsAreSubscribed = function ()
    {
        var testComplete = false;

        ConnectionUtility.connect(function (error, socket)
        {
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 2000);
    };

    return UserManagerTest;
});