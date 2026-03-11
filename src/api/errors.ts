/**
 * Error thrown when the request is malformed or invalid (HTTP 400).
 *
 * @property message - Human-readable error description
 */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when the user is not authenticated (HTTP 401).
 *
 * @property message - Human-readable error description
 */
export class UserNotAuthenticatedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when the user lacks permission for the requested action (HTTP 403).
 *
 * @property message - Human-readable error description
 */
export class UserForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown when a requested resource does not exist (HTTP 404).
 *
 * @property message - Human-readable error description
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}
