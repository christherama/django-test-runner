export enum Status {
  PASS = "pass",
  FAIL = "fail",
  ERROR = "error",
}

export class TestSuite {
  private readonly fqName: string;
  private readonly className: string | undefined;
  public readonly name: string;

  constructor(
    public readonly id: string,
    public readonly errors: number,
    public readonly failures: number,
    public testCases: TestCase[]
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

  public status(): Status {
    if (this.errors + this.failures === 0) {
      return Status.PASS;
    } else if (this.errors === 0 && this.failures > 0) {
      return Status.FAIL;
    } else {
      return Status.ERROR;
    }
  }
}

export class TestCase {
  public readonly testName: string;
  public readonly failure: TestFailure | undefined;
  public readonly error: TestError | undefined;

  constructor(
    testName: string,
    failure: TestFailure | undefined,
    error: TestError | undefined
  ) {
    this.testName = testName;
    this.failure = failure;
    this.error = error;
  }

  public status(): Status {
    if (!this.failure && !this.error) {
      return Status.PASS;
    } else if (this.failure) {
      return Status.FAIL;
    } else {
      return Status.ERROR;
    }
  }
}

export class TestFailure {
  constructor(
    public readonly message: string,
    public readonly type: string,
    public readonly traceback: string | undefined = undefined
  ) {}
}

export class TestError {
  constructor(
    public readonly message: string,
    public readonly type: string,
    public readonly traceback: string | undefined = undefined
  ) {}
}
