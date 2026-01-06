import { ErrorStore } from "../../shared/errors/errorStore.js";

/**
 * Validates request body against a schema.
 * Fails fast with 400 on invalid input.
 */
export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        ErrorStore.validation(
          "Invalid request body",
          {
            issues: result.error.issues
          }
        )
      );
    }

    // Replace body with parsed (sanitized) data
    req.body = result.data;
    next();
  };
}
