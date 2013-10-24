require(['Game/src/scheduler', 'renderer', 'Game/src/plotManager', 'Game/src/commandManager', 'TestFramework/testRunner', 'Game/test/testDefinitions', 'Renderer/test/testDefinitions'],
    function (Scheduler, Renderer, PlotManager, CommandManager, TestFramework, GameTests, RendererTests)
    {
        'use strict';
        function onDocumentReady()
        {
            // Run the unit test suites before beginning
            var tests = GameTests.concat(RendererTests);
            TestFramework.runTests(tests, onTestsComplete, true);
        }

        function onTestsComplete(results)
        {
            outputTestResults(results);

            // Start the actual game
            Renderer.initialize(document.getElementById('canvas'));
            Scheduler.start();
            PlotManager.initialize();
        }

        function outputTestResults(results)
        {
            var testCount = 0;
            var failCount = 0;
            var warningCount = 0;

            for (var i = 0; i < results.length; i++)
            {
                var scenarioResult = results[i];
                testCount += scenarioResult.testCount;

                if (scenarioResult.setupException)
                    warningCount++;

                for (var j = 0; j < scenarioResult.tests.length; j++)
                {
                    var testResult = scenarioResult.tests[j];
                    if (testResult.setupException)
                        warningCount++;

                    if (testResult.exception)
                        failCount++;

                    if (testResult.tearDownException)
                        warningCount++;
                }

                if (scenarioResult.tearDownException)
                    warningCount++;
            }

            if (failCount || warningCount)
            {
                var resultElement = document.createElement('div');
                resultElement.id = 'testResults';
                resultElement.className = failCount ? 'error' : 'warning';

                var report = window.formatMessage('{0} out of {1} tests failed. {2} warnings occurred.', [failCount, testCount, warningCount]);
                var resultMessage = document.createElement('span');
                resultMessage.appendChild(document.createTextNode(report));
                resultElement.appendChild(resultMessage);

                document.body.appendChild(resultElement);
            }
        }

        if (document.readyState === 'complete')
            onDocumentReady();
        else
            window.addEventListener('load', onDocumentReady, false);
    });