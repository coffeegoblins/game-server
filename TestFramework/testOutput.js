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

        var fragment = document.createDocumentFragment();
        for (var i = 0; i < results.length; i++)
        {
            var scenarioResults = results[i];
            testCount += scenarioResults.testCount;

            var scenarioHeaderElement = createTextElement('h1', scenarioResults.name);
            fragment.appendChild(scenarioHeaderElement);

            if (scenarioResults.setupException)
            {
                warningCount++;
                fragment.appendChild(createTextElement('h3', 'Failed during setup', 'warning'));
                fragment.appendChild(createTextElement('p', scenarioResults.setupException.stack, 'exception'));
            }

            for (var j = 0; j < scenarioResults.tests.length; j++)
            {
                var testResults = scenarioResults.tests[j];
                var testHeaderElement = createTextElement('h2', testResults.name);
                fragment.appendChild(testHeaderElement);

                if (testResults.setupException)
                {
                    warningCount++;
                    fragment.appendChild(createTextElement('h3', 'Failed during setup', 'warning'));
                    fragment.appendChild(createTextElement('p', testResults.setupException.stack, 'exception'));
                }

                if (testResults.exception)
                {
                    failCount++;
                    scenarioResults.hasError = true;
                    fragment.appendChild(createTextElement('h3', 'Failed during execution', 'error'));
                    fragment.appendChild(createTextElement('p', testResults.exception.stack, 'exception'));
                }

                if (testResults.tearDownException)
                {
                    warningCount++;
                    fragment.appendChild(createTextElement('h3', 'Failed during tearDown', 'warning'));
                    fragment.appendChild(createTextElement('p', testResults.tearDownException.stack, 'exception'));
                }

                if (testResults.exception)
                    testHeaderElement.className = 'error';
                else if (testResults.setupException || testResults.tearDownException)
                    testHeaderElement.className = 'warning';
            }

            if (scenarioResults.tearDownException)
            {
                warningCount++;
                fragment.appendChild(createTextElement('h3', 'Failed during tearDown', 'warning'));
                fragment.appendChild(createTextElement('p', scenarioResults.tearDownException.stack, 'exception'));
            }

            if (scenarioResults.hasError)
                scenarioHeaderElement.className = 'error';
            else if (scenarioResults.setupException || scenarioResults.tearDownException)
                scenarioHeaderElement.className = 'warning';
        }

        while (document.body.firstChild)
            document.body.removeChild(document.body.firstChild);

        var report = window.formatMessage('{0} out of {1} tests passed. {2} warnings occurred.', [testCount - failCount, testCount, warningCount]);

        var resultBannerClass = 'resultBanner';
        if (failCount)
            resultBannerClass += ' resultBannerError';
        else if (warningCount)
            resultBannerClass += ' resultBannerWarning';

        fragment.insertBefore(createTextElement('span', report, resultBannerClass), fragment.firstChild);
        document.body.appendChild(fragment);
    };

    return TestOutput;
});