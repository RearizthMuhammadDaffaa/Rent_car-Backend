import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message = "Conflict Error") {
    super(409, message);
  }
}