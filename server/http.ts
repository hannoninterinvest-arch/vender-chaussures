export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
  getStatus() {
    return this.status;
  }
}
export class BadRequestException extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}
export class UnauthorizedException extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}
export class ForbiddenException extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}
export class NotFoundException extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}
export class ConflictException extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}
export class PayloadTooLargeException extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}
export class UnsupportedMediaTypeException extends HttpError {
  constructor(message: string) {
    super(415, message);
  }
}
export class ServiceUnavailableException extends HttpError {
  constructor(message: string) {
    super(503, message);
  }
}
export class Logger {
  constructor(private readonly name: string) {}
  warn(message: string) {
    console.warn(this.name, message);
  }
}
