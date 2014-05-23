define(['../connectionUtility'], function (ConnectionUtility)
{
    'use strict';

    function UserManagerRegisterTest()
    {
        this.name = 'User Manager Register Test';
    }

    UserManagerRegisterTest.prototype.scenarioSetupAsync = function (finishedCallback)
    {
        ConnectionUtility.connect(function (connectionError, socket, events)
        {                
            this.registerEvents = events !== null ? events.register : null;
            this.clientSocket = socket;
            
            finishedCallback(connectionError);
        }.bind(this));
    }

    UserManagerRegisterTest.prototype.scenarioTearDown = function ()
    {
        ConnectionUtility.disconnect();
    }

    UserManagerRegisterTest.prototype.testRegistrationUserAlreadyExists = function ()
    {
        var testComplete = false;
        
        var username = Math.random().toString();
        var password = Math.random().toString();

        this.clientSocket.emit(this.registerEvents.name, username, password);
        this.clientSocket.emit(this.registerEvents.name, username, password);

        this.clientSocket.on(this.registerEvents.response.error, function (error)
        {
            assertTruthy(error !== null);
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, 'The user was able to register twice.', 2000);
    };

    UserManagerRegisterTest.prototype.testRegistrationUserIsCreated = function ()
    {
        var testComplete = false;
        
        var username = Math.random().toString();
        var password = Math.random().toString();

        this.clientSocket.emit(this.registerEvents.name, username, password);

        this.clientSocket.on(this.registerEvents.response.success, function (user)
        {
            assertTruthy('No user was created.', user);
            assertEquals('Username did not match.', user.username, username);
            testComplete = true;
        });

        async(function ()
        {
            return testComplete;
        }, "The user wasn't able to register.", 2000);
        
    };

    return UserManagerRegisterTest;
});