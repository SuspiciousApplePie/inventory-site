export class PageNotFound extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = "Page Not Found Error";
  }
}

export class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "Bad Request";
  }
}
