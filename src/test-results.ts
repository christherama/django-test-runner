export class TestSuite {
  private readonly fqName: string;
  private readonly className: string | undefined;
  public readonly name: string;

  constructor(
    public readonly id: string,
    public testCases: TestCase[] | undefined = undefined
  ) {
    this.fqName = id.slice(0, -15);
    this.className = this.fqName.split(".").pop();
    this.name = this.className ? this.className : this.fqName;
  }

  public add(testCase: TestCase): void {
    if (!this.testCases) {
      this.testCases = [];
    }
    this.testCases.push(testCase);
  }
}

export class TestCase {
  passed: boolean;

  constructor(
    public readonly testName: string,
    public readonly failure: TestFailure | undefined = undefined,
    public readonly error: TestError | undefined = undefined
  ) {
    this.passed = !this.failure && !this.error;
  }
}

export class TestFailure {
  constructor(
    public readonly message: string,
    public readonly type: string,
    public readonly traceback: string
  ) {}
}

export class TestError {
  constructor(
    public readonly message: string,
    public readonly type: string,
    public readonly traceback: string
  ) {}
}
