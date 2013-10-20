define(['./assertions', './asyncFramework', './testOutput'], function (Assertions, AsyncFramework, TestOutput)
{
    'use strict';

    var isReady = false;
    var onReady = function () {isReady = true;};

    var scenarios = [];
    var output = [];

    var currentScenario;
    var currentTestIndex;
    var onCompleteCallback;


    function TestFramework() { }

    AsyncFramework.onMethodComplete = function ()
    {
        onScenarioTestFinished();
    };

    AsyncFramework.onMethodException = function (e)
    {
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
            return e;
        }
    }

    function beginExecutingScenario()
    {
        currentScenario = scenarios.shift();
        currentScenario.output = {name: currentScenario.scenario.name, testCount: currentScenario.methods.length, tests: []};
        currentScenario.output.setupException = executeMethod(currentScenario.scenario.scenarioSetup, currentScenario.scenario);

        currentTestIndex = 0;
        executeScenarioTests();
    }

    function executeScenarioTests()
    {
        var testOutput = {name: currentScenario.methods[currentTestIndex]};
        testOutput.setupException = executeMethod(currentScenario.scenario.setup, currentScenario.scenario);

        testOutput.exception = executeMethod(currentScenario.scenario[currentScenario.methods[currentTestIndex]], currentScenario.scenario);
        currentScenario.output.tests[currentTestIndex] = testOutput;

        if (!AsyncFramework.isRunning())
            onScenarioTestFinished();
    }

    function onScenarioTestFinished()
    {
        currentScenario.output.tests[currentTestIndex].tearDownException = executeMethod(currentScenario.scenario.tearDown, currentScenario.scenario);
        Assertions.clearWatches();

        currentTestIndex++;
        if (currentTestIndex < currentScenario.methods.length)
            executeScenarioTests();
        else
            finishExecutingScenario();
    }

    function finishExecutingScenario()
    {
        currentScenario.output.tearDownException = executeMethod(currentScenario.scenario.scenarioTearDown, currentScenario.scenario);
        output.push(currentScenario.output);
        currentScenario = null;

        if (scenarios.length)
            beginExecutingScenario();
        else if (onCompleteCallback)
            onCompleteCallback(output);
        else
            TestOutput.display(output);
    }

    TestFramework.runTests = function (testScenarios, onComplete)
    {
        if (!isReady)
        {
            onReady = function ()
            {
                isReady = true;
                TestFramework.runTests(testScenarios, onComplete);
            };

            return;
        }

        onCompleteCallback = onComplete;
        for (var i = 0; i < testScenarios.length; i++)
        {
            var methods = [];
            var scenario = testScenarios[i];
            for (var property in scenario)
            {
                if (typeof(scenario[property]) === 'function' && !/setup|tearDown|scenarioSetup|scenarioTearDown/.test(property))
                    methods.push(property);
            }

            if (methods.length)
                scenarios.push({scenario: scenario, methods: methods});
        }

        if (scenarios.length)
            beginExecutingScenario();
    };

    if (document.readyState === 'complete')
        onReady();
    else
        window.addEventListener('load', onReady, false);


    return TestFramework;
});