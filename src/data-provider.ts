import * as vscode from "vscode";
import * as fs from "fs";
import { parseStringPromise as xmlParseString } from "xml2js";
import {
  TestSuite,
  TestCase,
  TestFailure,
  TestError,
  Status,
} from "./test-results";
import path = require("path");

export class DjangoTestDataProvider
  implements vscode.TreeDataProvider<DjangoTestItem> {
  testSuites: TestSuite[] = [];

  constructor(private workspaceRoot: string, private testReportPath: string) {
    this.fetchTestResults();
    vscode.workspace
      .createFileSystemWatcher(testReportPath)
      .onDidChange(() => this.fetchTestResults());
  }

  private async fetchTestResults() {
    const reportContent = fs.readFileSync(this.testReportPath, "utf-8");
    const xml = await xmlParseString(reportContent);
    this.testSuites = xml.testsuites.testsuite.map(
      (testsuite: {
        $: { name: string; errors: string; failures: string };
        testcase: [
          {
            $: { name: string };
            failure: [{ $: { message: string; type: string }; _: string }];
            error: [{ $: { message: string; type: string }; _: string }];
          }
        ];
      }) => {
        // Use testsuite name as id since it includes timestamp
        const id = testsuite.$.name;

        const testCases = testsuite.testcase.map((testcase) => {
          const failure = testcase.failure
            ? new TestFailure(
                testcase.failure[0].$.message,
                testcase.failure[0].$.type,
                testcase.failure[0]._
              )
            : undefined;
          const error = testcase.error
            ? new TestError(
                testcase.error[0].$.message,
                testcase.error[0].$.type,
                testcase.error[0]._
              )
            : undefined;
          return new TestCase(testcase.$.name, failure, error);
        });

        return new TestSuite(
          id,
          parseInt(testsuite.$.errors),
          parseInt(testsuite.$.failures),
          testCases
        );
      }
    );
    this.refresh();
  }

  private _onDidChangeTreeData: vscode.EventEmitter<
    DjangoTestItem | undefined
  > = new vscode.EventEmitter<DjangoTestItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<DjangoTestItem | undefined> = this
    ._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: DjangoTestItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: DjangoTestItem): DjangoTestItem[] {
    if (element) {
      return element.getChildren();
    } else {
      // root element
      return this.testSuites.map(
        (testSuite) => new TestSuiteTreeItem(testSuite)
      );
    }
  }
}

abstract class DjangoTestItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly testItem: TestSuite | TestCase,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed
  ) {
    super(label, collapsibleState);
  }

  iconPath = {
    light: path.join(
      __filename,
      "..",
      "..",
      "resources",
      `${this.testItem.status()}.svg`
    ),
    dark: path.join(
      __filename,
      "..",
      "..",
      "resources",
      `${this.testItem.status()}.svg`
    ),
  };

  public getChildren(): DjangoTestItem[] {
    return [];
  }
}

class TestSuiteTreeItem extends DjangoTestItem {
  testSuite: TestSuite;

  constructor(testSuite: TestSuite) {
    super(testSuite.name, testSuite);
    this.testSuite = testSuite;
  }

  public getChildren() {
    if (!this.testSuite.testCases) {
      return [];
    }
    return this.testSuite.testCases.map(
      (testCase) => new TestCaseTreeItem(testCase)
    );
  }
}

class TestCaseTreeItem extends DjangoTestItem {
  constructor(private testCase: TestCase) {
    super(testCase.testName, testCase, vscode.TreeItemCollapsibleState.None);
  }

  get tooltip(): string {
    switch (this.testCase.status()) {
      case Status.FAIL:
        return this.testCase.failure?.traceback ?? "";
      case Status.ERROR:
        return this.testCase.error?.traceback ?? "";
      default:
        return "";
    }
  }
}
