export class BaseError<D = any> extends Error {
  status: number;
  name: string;
  details?: D;
  stack?: string | undefined;

  constructor(status: number, message: string, details?: D) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }
  }
}
