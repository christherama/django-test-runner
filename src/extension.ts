// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DjangoTestDataProvider } from "./django-test-data-provider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.rootPath;
  console.log(
	`Registering TreeDataProvider with workspace root ${workspaceRoot}`
  );
  if (workspaceRoot) {
    vscode.window.registerTreeDataProvider(
      "django-tests",
      new DjangoTestDataProvider(workspaceRoot)
    );
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "django-test-runner.runTests",
    () => {
      // The code you place here will be executed every time your command is executed

      const editor = vscode.window.activeTextEditor;

      const filePath = editor?.document.fileName;
      if (!editor || !filePath) {
        console.log("No editor open");
        return;
      }
      if (!workspaceRoot) {
        console.log("No root path");
        return;
      }
      const filePathRelativeToWorkspace = filePath.replace(
        `${workspaceRoot}/`,
        ""
      );
      const module = filePathRelativeToWorkspace
        .replace(".py", "")
        .replace(/\//g, ".");

      // Get cursor line number
      let lineNumber = editor.selection.start.line;

      // Get test class and/or function
      let testClass = null;
      let testFunction = null;
      let n = lineNumber;
      do {
        const line = editor.document.lineAt(lineNumber).text;
        if (!testFunction) {
          testFunction = getTestFunctionName(line);
        }
        testClass = getTestClassName(line);
        lineNumber--;
      } while (!testClass && lineNumber >= 0);

      let testModule = module;
      if (testClass) {
        testModule =
          `${module}.${testClass}` + (testFunction ? `.${testFunction}` : "");
      }

      // Run module tests in terminal
      const terminal = getTerminal();
      terminal.sendText(`python manage.py test ${testModule}`);
    }
  );

  context.subscriptions.push(disposable);
}

function getTestFunctionName(line: string): any {
  const match = line.match(/^ *def (?<functionName>\w+)\(.*?\):/);
  if (match && match.groups) {
    return match.groups.functionName;
  }
  return null;
}

function getTestClassName(line: string): any {
  const match = line.match(/^ *class (?<className>\w+)\(.*?\)?:/);
  if (match && match.groups) {
    return match.groups.className;
  }
  return null;
}

function getTerminal(): vscode.Terminal {
  let terminal = vscode.window.terminals.find(
    (terminal) => terminal.name === "django-test-runner"
  );
  if (!terminal) {
    terminal = vscode.window.createTerminal("django-test-runner");
  }
  return terminal;
}

// this method is called when your extension is deactivated
export function deactivate() {}
