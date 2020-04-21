export class TestSuite {
  constructor(
    public readonly id: string,
    public readonly className: string,
    public readonly tests: TestCase[]
  ) {}
}

export class TestCase {
  passed: boolean;

  constructor(
    public readonly testName: string,
    public readonly failure: TestFailure | undefined,
    public readonly error: TestError | undefined
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
