define(function ()
{
    'use strict';

    function TestOutput() { }

    function createTextElement(type, text, className)
    {
        var element = document.createElement(type);
        element.appendChild(document.createTextNode(text));
        element.className = className;
        return element;
    }

    TestOutput.display = function (results)
    {
        var testCount = 0;
        var failCount = 0;
        var warningCount = 0;

        var passesDiv = document.getElementById('passes');
        var failureDiv = document.getElementById('failures');
        var bannerDiv = document.getElementById('banner');

        for (var i = 0; i < results.length; i++)
        {
            var passedFragment = document.createDocumentFragment();
            var failedFragment = document.createDocumentFragment();

            var scenarioResult = results[i];
            testCount += scenarioResult.testCount;

            if (scenarioResult.setupException)
            {
                warningCount++;
                failedFragment.appendChild(createTextElement('h3', 'Failed during setup', 'warning'));
                failedFragment.appendChild(createTextElement('p', scenarioResult.setupException.stack, 'exception'));
            }

            for (var j = 0; j < scenarioResult.tests.length; j++)
            {
                var testResult = scenarioResult.tests[j];
                var testHeaderElement = createTextElement('h2', testResult.name);

                if (testResult.exception)
                {
                    testHeaderElement.className = 'error';
                    failedFragment.appendChild(testHeaderElement);
                }
                else if (testResult.setupException || testResult.tearDownException)
                {
                    testHeaderElement.className = 'warning';
                    passedFragment.appendChild(testHeaderElement);
                }
                else
                {
                    passedFragment.appendChild(testHeaderElement);
                }

                if (testResult.setupException)
                {
                    warningCount++;
                    failedFragment.appendChild(createTextElement('h3', 'Failed during setup', 'warning'));
                    failedFragment.appendChild(createTextElement('p', testResult.setupException.stack, 'exception'));
                }

                if (testResult.exception)
                {
                    failCount++;
                    scenarioResult.hasError = true;
                    failedFragment.appendChild(createTextElement('h3', 'Failed during execution', 'error'));
                    failedFragment.appendChild(createTextElement('p', testResult.exception.stack, 'exception'));
                }

                if (testResult.tearDownException)
                {
                    warningCount++;
                    failedFragment.appendChild(createTextElement('h3', 'Failed during tearDown', 'warning'));
                    failedFragment.appendChild(createTextElement('p', testResult.tearDownException.stack, 'exception'));
                }
            }

            if (scenarioResult.tearDownException)
            {
                warningCount++;
                failedFragment.appendChild(createTextElement('h3', 'Failed during tearDown', 'warning'));
                failedFragment.appendChild(createTextElement('p', scenarioResult.tearDownException.stack, 'exception'));
            }

            if (passedFragment.firstChild)
            {
                var scenarioHeaderElement = createTextElement('h1', scenarioResult.name);
                if (scenarioResult.setupException || scenarioResult.tearDownException)
                    scenarioHeaderElement.className = 'warning';

                passedFragment.insertBefore(scenarioHeaderElement, passedFragment.firstChild);
                passesDiv.appendChild(passedFragment);
            }

            if (failedFragment.firstChild)
            {
                var scenarioHeaderFailedElement = createTextElement('h1', scenarioResult.name, 'error');
                failedFragment.insertBefore(scenarioHeaderFailedElement, failedFragment.firstChild);
                failureDiv.appendChild(failedFragment);
            }
        }

        var resultBannerClass = 'resultBanner';
        if (failCount)
            resultBannerClass += ' resultBannerError';
        else if (warningCount)
            resultBannerClass += ' resultBannerWarning';

        var report = window.formatMessage('{0} out of {1} tests passed. {2} warnings occurred.', [testCount - failCount, testCount, warningCount]);
        bannerDiv.appendChild(createTextElement('span', report, resultBannerClass));
    };

    return TestOutput;
});