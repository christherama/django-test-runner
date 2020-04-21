import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { parseStringPromise as xmlParseString } from "xml2js";

const TEST_REPORT_FILE_NAME = "nosetests.xml";

export class DjangoTestDataProvider
  implements vscode.TreeDataProvider<DjangoTestItem> {
  constructor(private workspaceRoot: string) {}

  onDidChangeTreeData?: vscode.Event<any> | undefined;

  getTreeItem(element: DjangoTestItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: any): Thenable<DjangoTestItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      // root element
      const testReportPath = path.join(
        this.workspaceRoot,
        TEST_REPORT_FILE_NAME
      );
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
        //-20200421040016
        return new DjangoTestItem(testsuite.$.name.slice(0, -15));
      })
    );
  }
}

class DjangoTestItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.Collapsed
  ) {
    super(label, collapsibleState);
  }
}
