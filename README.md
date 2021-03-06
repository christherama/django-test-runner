# django-test-runner

This VS Code extension gives quick access to running Django tests by invoking `python manage.py test` with the VS Code action `Django Test Runner: Run Tests` or a keyboard shortcut. This will run tests in a VS Code terminal. You can optionally display the status of tests by [configuring an XMLRunner test report](#parsing-an-xmlrunner-testreport).

---

# Configuration

## Using pyenv or another virtual environment

If you aren't using your system's default Python interpreter, complete the following:

1. Add your interpreter's path in the setting `djangoTestRunner.pythonInterpreter`
2. Uncheck `python.terminal.activateEnvironment` to skip the `source` step, which slows testing with this extension (though doesn't interfere with testing)

## Parsing an XMLRunner Test Report

If you are using [XMLRunner](https://github.com/xmlrunner/unittest-xml-reporting) to generate an XML test report, complete the following:

1. Set `djangoTestRunner.xmlRunnerReportPath` to the report path, which is relative to the workspace root, e.g. `report.xml`
2. If you require additional arguments to be appended to the `python manage.py test` to generate those reports, you can specify those in the setting `djangoTestRunner.testArgs`

## Features

Run Django Tests with a VS Code action or keybinding (defaults to CMD+SHIFT+R for MacOS and CTRL+SHIFT+R for Windows):
![run django tests demo](./images/run-tests.gif)

**Notes**

- A test file must be open to invoke a Django test run
- Tests to run are determined by the first function or class definition found on or before the cursor position
- If no class or function definition is found, the entire module will be run

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

This extension contributes the following settings:

- `djangoTestRunner.pythonInterpreter`: Path to Python interpreter if not using system default `python`. For example, `~/.pyenv/versions/sample-env/bin/python`
- `djangoTestRunner.useDefaultShell`: Whether or not to use VS Code's default shell. If false, will use `/bin/sh`.
- `djangoTestRunner.xmlRunnerReportPath`: Path (relative to workspace root) to XML report generated by XMLRunner
- `djangoTestRunner.testArgs`: Arguments to append to `python manage.py test <test-label>`.

## Known Issues

- This extension has been tested only on MacOS.
- Running Django tests will run a non-test function (e.g. `setUp`) if the first function found on or before the cursor position is not a test function, and a class definition isn't found first

## Release Notes

### 0.1.0

This release includes only documentation changes:

- Animated feature gif
- Usage notes
- Known issues

### 0.0.1

Initial release
