define(['./assertions', './asyncFramework', './testOutput'], function (Assertions, AsyncFramework, TestOutput)
{
    'use strict';

    var isReady = false;
    var onReady = function ()
    {
        isReady = true;
    };

    var scenarioQueue = [];
    var output = [];

    var currentScenario;
    var currentTestIndex;
    var onCompleteCallback;
    var useLogger;


    function TestFramework()
    {}

    AsyncFramework.onMethodComplete = function ()
    {
        onScenarioTestFinished();
    };

    AsyncFramework.onMethodException = function (e)
    {
        if (useLogger)
            console.log(e.stack);

        currentScenario.output.tests[currentTestIndex].exception = e;
        onScenarioTestFinished();
    };


    function executeMethod(method, context)
    {
        try
        {
            if (method)
                method.call(context);
        }
        catch (e)
        {
            if (useLogger)
                console.log(e.stack);

            return e;
        }
    }

    function executeAsyncMethod(method, context, finishedCallback)
    {
        try
        {
            if (method)
            {
                method.call(context, finishedCallback);
                return;
            }

            finishedCallback(null);
        }
        catch (e)
        {
            if (useLogger)
                console.log(e.stack);

            return e;
        }
    }

    function beginExecutingScenario()
    {
        currentScenario = scenarioQueue.shift();

        currentScenario.output = {
            name: currentScenario.scenario.name,
            testCount: currentScenario.methods.length,
            tests: []
        };

        executeAsyncMethod(currentScenario.scenario.scenarioSetupAsync, currentScenario.scenario, function (error)
        {
            currentScenario.output.setupException = error;
            currentScenario.output.setupException += executeMethod(currentScenario.scenario.scenarioSetup, currentScenario.scenario);

            currentTestIndex = 0;
            executeScenarioTests();
        });
    }

    function executeScenarioTests()
    {
        var testOutput = {
            name: currentScenario.methods[currentTestIndex]
        };

        executeAsyncMethod(currentScenario.scenario.setupAsync, currentScenario.scenario, function (error)
        {
            testOutput.setupException = error;
            testOutput.setupException = executeMethod(currentScenario.scenario.setup, currentScenario.scenario);

            testOutput.exception = executeMethod(currentScenario.scenario[currentScenario.methods[currentTestIndex]], currentScenario.scenario);
            currentScenario.output.tests[currentTestIndex] = testOutput;

            if (!AsyncFramework.isRunning())
                onScenarioTestFinished();
        });
    }

    function onScenarioTestFinished()
    {
        executeAsyncMethod(currentScenario.scenario.tearDownAsync, currentScenario.scenario, function (error)
        {
            currentScenario.output.tests[currentTestIndex].tearDownException = error;
            currentScenario.output.tests[currentTestIndex].tearDownException = executeMethod(currentScenario.scenario.tearDown, currentScenario.scenario);
            Assertions.clearWatches();

            currentTestIndex++;
            if (currentTestIndex < currentScenario.methods.length)
                executeScenarioTests();
            else
                finishExecutingScenario();
        });
    }

    function finishExecutingScenario()
    {
        executeAsyncMethod(currentScenario.scenario.scenarioTearDownAsync, currentScenario.scenario, function (error)
        {
            currentScenario.output.tearDownException = executeMethod(currentScenario.scenario.scenarioTearDown, currentScenario.scenario);
            output.push(currentScenario.output);
            currentScenario = null;

            if (scenarioQueue.length)
                beginExecutingScenario();
            else if (onCompleteCallback)
                onCompleteCallback(output);
            else
                TestOutput.display(output);
        });
    }

    TestFramework.runTests = function (testScenarios, onComplete, logErrors)
    {
        if (!isReady)
        {
            onReady = function ()
            {
                isReady = true;
                TestFramework.runTests(testScenarios, onComplete, logErrors);
            };

            return;
        }

        useLogger = logErrors;
        onCompleteCallback = onComplete;

        for (var i = 0; i < testScenarios.length; i++)
        {
            var methods = [];
            var scenario = testScenarios[i];
            for (var property in scenario)
            {
                // Add tests
                if (typeof (scenario[property]) === 'function' && !/setup|setupAsync|tearDownAsync|tearDown|scenarioSetup|scenarioSetupAsync|scenarioTearDown|scenarioTearDownAsync/.test(property))
                    methods.push(property);
            }

            if (methods.length)
            {
                scenarioQueue.push(
                {
                    scenario: scenario,
                    methods: methods
                });
            }
        }

        if (scenarioQueue.length)
            beginExecutingScenario();
    };

    if (document.readyState === 'complete')
        onReady();
    else
        window.addEventListener('load', onReady, false);


    return TestFramework;
});
