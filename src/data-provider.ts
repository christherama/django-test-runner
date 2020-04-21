import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { parseStringPromise as xmlParseString } from "xml2js";
import { TestSuite } from "./test-results";

export class DjangoTestDataProvider
  implements vscode.TreeDataProvider<DjangoTestItem> {
  xml: string | any = null;
  results: TestSuite[] | any = null;

  constructor(private workspaceRoot: string, private testReportPath: string) {
    this.fetchTestResults(testReportPath);
  }

  private async fetchTestResults(testReportPath: string) {
    const reportContent = fs.readFileSync(testReportPath, "utf-8");
    this.xml = await xmlParseString(reportContent);
  }

  onDidChangeTreeData?: vscode.Event<any> | undefined;

  getTreeItem(element: DjangoTestItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: any): Thenable<DjangoTestItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      // root element
      const testReportPath = path.join(this.workspaceRoot, this.testReportPath);
      const testClasses = Promise.resolve(this.getTestClasses(testReportPath));
      console.log(JSON.stringify(testClasses, null, 2));
      return testClasses;
    }
  }

  private async getTestClasses(
    testReportPath: string
  ): Promise<DjangoTestItem[]> {
    const reportContent = fs.readFileSync(testReportPath, "utf-8");
    const xml = await xmlParseString(reportContent);
    return Promise.resolve(
      xml.testsuites.testsuite.map((testsuite: { $: { name: string } }) => {
        // Use testsuite name as id since it includes timestamp
        const id = testsuite.$.name;

        // Get fully-qualified name by stripping
        // timestamp from end of testsuite name, e.g. `-20200421040016`
        const fqName = id.slice(0, -15);

        // Get short class name
        const className = fqName.split(".").pop();

        // Favor short over fully-qualified name
        const label = className ? className : fqName;
        return new DjangoTestItem(id, label);
      })
    );
  }
}

class DjangoTestItem extends vscode.TreeItem {
  constructor(
    public readonly id: string,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Expanded
  ) {
    super(label, collapsibleState);
  }
}
