import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { parseStringPromise as xmlParseString } from "xml2js";
import { TestSuite, TestCase } from "./test-results";

export class DjangoTestDataProvider
  implements vscode.TreeDataProvider<DjangoTestItem> {
  testSuites: TestSuite[] = [];

  constructor(private workspaceRoot: string, private testReportPath: string) {
    this.fetchTestResults(testReportPath);
  }

  private async fetchTestResults(testReportPath: string) {
    const reportContent = fs.readFileSync(testReportPath, "utf-8");
    const xml = await xmlParseString(reportContent);
    this.testSuites = xml.testsuites.testsuite.map(
      (testsuite: { $: { name: string }; testcase: [{ name: string }] }) => {
        // Use testsuite name as id since it includes timestamp
        const id = testsuite.$.name;

        const testCases = testsuite.testcase.map((testcase) => {
          return new TestCase(testcase.name);
        });

        return new TestSuite(id, testCases);
      }
    );
  }

  onDidChangeTreeData?: vscode.Event<any> | undefined;

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
      // const testReportPath = path.join(this.workspaceRoot, this.testReportPath);
      // const testClasses = Promise.resolve(this.getTestClasses(testReportPath));
      // console.log(JSON.stringify(testClasses, null, 2));
      // return testClasses;
    }
  }

  // private async getTestClasses(
  //   testReportPath: string
  // ): Promise<DjangoTestItem[]> {
  //   const reportContent = fs.readFileSync(testReportPath, "utf-8");
  //   const xml = await xmlParseString(reportContent);
  //   return Promise.resolve(
  //     xml.testsuites.testsuite.map((testsuite: { $: { name: string } }) => {
  //       // Use testsuite name as id since it includes timestamp
  //       const id = testsuite.$.name;

  //       // Get fully-qualified name by stripping
  //       // timestamp from end of testsuite name, e.g. `-20200421040016`
  //       const fqName = id.slice(0, -15);

  //       // Get short class name
  //       const className = fqName.split(".").pop();

  //       // Favor short over fully-qualified name
  //       const label = className ? className : fqName;
  //       return new DjangoTestItem(id, label);
  //     })
  //   );
  // }
}

class DjangoTestItem extends vscode.TreeItem {
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
    super(testCase.testName, testCase);
  }

  public getChildren() {
    return [];
  }
}
