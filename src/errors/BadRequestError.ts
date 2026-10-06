import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}