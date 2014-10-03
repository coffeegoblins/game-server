define(['./system tests/userManagerLoginTest',
        './system tests/userManagerRegisterTest'],
    function (UserManagerLoginTest, UserManagerRegisterTest)
    {
        'use strict';

        return [
            new UserManagerLoginTest(),
            new UserManagerRegisterTest()
        ];
    });
