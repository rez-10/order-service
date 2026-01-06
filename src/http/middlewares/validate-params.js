import { ErrorStore } from "../../shared/errors/errorStore.js";

/**
 * Validates route params against a schema.
 */
export function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(
        ErrorStore.validation(
          "Invalid route parameters",
          {
            issues: result.error.issues
          }
        )
      );
    }

    req.params = result.data;
    next();
  };
}
