export const ErrorResponse = (error) => {
  return {
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.message || "Something went wrong",
    },
  };
};
