import * as vscode from "vscode";
import * as fs from "fs";
import { parseStringPromise as xmlParseString } from "xml2js";
import { TestSuite, TestCase } from "./test-results";

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
        $: { name: string };
        testcase: [{ $: { name: string } }];
      }) => {
        // Use testsuite name as id since it includes timestamp
        const id = testsuite.$.name;

        const testCases = testsuite.testcase.map((testcase) => {
          return new TestCase(testcase.$.name);
        });

        return new TestSuite(id, testCases);
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
  constructor(testCase: TestCase) {
    super(testCase.testName, testCase, vscode.TreeItemCollapsibleState.None);
  }
}
