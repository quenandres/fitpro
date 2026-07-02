export class ExerciseDbError extends Error {
  readonly status?: number;
  readonly path?: string;

  constructor(message: string, status?: number, path?: string) {
    super(message);
    this.name = 'ExerciseDbError';
    this.status = status;
    this.path = path;
  }
}

export class ExerciseDbValidationError extends Error {
  readonly field?: string;
  readonly issues?: unknown;

  constructor(message: string, field?: string, issues?: unknown) {
    super(message);
    this.name = 'ExerciseDbValidationError';
    this.field = field;
    this.issues = issues;
  }
}
