// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "django-test-runner" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "django-test-runner.runTests",
    () => {
      // The code you place here will be executed every time your command is executed

      const editor = vscode.window.activeTextEditor;
      console.log(JSON.stringify(vscode.workspace.workspaceFolders, null, 2));
      const rootDir = vscode.workspace.rootPath;

      // Display a message box to the user
      vscode.window.showInformationMessage(
        `current file name is ${editor?.document.fileName}, root dir is ${rootDir}`
      );

      // Run a command in a terminal
      const terminal = getTerminal();
      terminal.sendText(
        "python manage.py test spothero.views.tests.test_ssr_view"
      );
    }
  );

  context.subscriptions.push(disposable);
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
