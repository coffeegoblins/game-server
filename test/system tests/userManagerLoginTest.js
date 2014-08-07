define(['../connectionUtility', '../userTestUtility'], function (ConnectionUtility, UserTestUtility)
{
    'use strict';

    function UserManagerLoginTest()
    {
        this.name = 'User Manager Login Test';
    }

    UserManagerLoginTest.prototype.scenarioSetupAsync = function (finishedCallback)
    {
        ConnectionUtility.connect(function (connectionError, socket, events)
        {
            if (connectionError)
            {
                finishedCallback(connectionError);
                return;
            }

            UserTestUtility.createUser(socket, events, function (error, user)
            {
                this.testUser = user;
                this.loginEvents = events.login;
                this.clientSocket = socket;
                
                finishedCallback(error);
            }.bind(this));
        }.bind(this));
    }

    UserManagerLoginTest.prototype.scenarioTearDown = function ()
    {
        ConnectionUtility.disconnect();
    }

    UserManagerLoginTest.prototype.testLoginPasswordMustMatch = function ()
    {
        var testComplete = false;

        this.clientSocket.emit(this.loginEvents.name, this.testUser.username, "INVALID");

        this.clientSocket.on(this.loginEvents.response.error, function (error)
        {
            assertTruthy(error !== null);
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 'The user did not fail to login.', 2000);
    };

    UserManagerLoginTest.prototype.testLoginUserDoesNotExist = function ()
    {
        var testComplete = false;

        this.clientSocket.emit(this.loginEvents.name, "INVALID", "INVALID");

        this.clientSocket.on(this.loginEvents.response.error, function (error)
        {
            assertTruthy(error !== null);
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 'The user did not fail to login.', 2000);
    };

    UserManagerLoginTest.prototype.testLoginSuccess = function ()
    {
        var testComplete = false;

        this.clientSocket.emit(this.loginEvents.name, this.testUser.username, this.testUser.password);

        this.clientSocket.on(this.loginEvents.response.success, function (serverUser)
        {
            assertTruthy('The call was successful, but the user is undefined.', serverUser);
            assertTruthy('An invalid user database object was returned.', serverUser._id);
            assertTruthy('An invalid user database object was returned.', this.testUser._id !== null);
            assertEquals('The server user did not equal the login user', serverUser.username, this.testUser.username);
            testComplete = true;
        }.bind(this));

        async(function ()
        {
            return testComplete;
        }, 'The user was unable to login.', 2000);
    };

    return UserManagerLoginTest;
});