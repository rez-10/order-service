export const POSTGRES_ERROR_CODES = {
  SERIALIZATION_FAILURE: "40001",
  DEADLOCK_DETECTED: "40P01",
};

export function isRetryablePostgresError(err) {
  if (!err || !err.code) return false;

  return (
    err.code === POSTGRES_ERROR_CODES.SERIALIZATION_FAILURE ||
    err.code === POSTGRES_ERROR_CODES.DEADLOCK_DETECTED
  );
}
