/**
 * Typed error hierarchy for the rename engine.
 *
 * Every error thrown from the public surface derives from {@link RenameError}
 * so callers can catch a single base type and still inspect fine-grained
 * subclasses for observability.
 */

export class RenameError extends Error {
  public override readonly name: string = 'RenameError';
}

/** Thrown when a regex pattern fails the {@link safe-regex} star-height guard. */
export class UnsafeRegexError extends RenameError {
  public override readonly name = 'UnsafeRegexError';
  public readonly pattern: string;
  public readonly reason: string;

  public constructor(pattern: string, reason: string) {
    super(`Unsafe regex rejected: ${pattern} — ${reason}`);
    this.pattern = pattern;
    this.reason = reason;
  }
}

/** Thrown when a {@link RenamePattern} fails Zod validation. */
export class InvalidPatternError extends RenameError {
  public override readonly name = 'InvalidPatternError';
  public readonly issues: readonly unknown[];

  public constructor(message: string, issues: readonly unknown[]) {
    super(message);
    this.issues = issues;
  }
}

/** Thrown when a template references an unknown or malformed placeholder. */
export class InvalidTemplateError extends RenameError {
  public override readonly name = 'InvalidTemplateError';
  public readonly token: string;

  public constructor(token: string, message: string) {
    super(`Invalid template token "${token}": ${message}`);
    this.token = token;
  }
}
