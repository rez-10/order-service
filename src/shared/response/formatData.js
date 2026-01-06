export const formatData = (data, options = {}) => {
  if (data == null) return data;

  const { pick, omit } = options;

  // Pick specific fields
  if (Array.isArray(pick)) {
    return Object.fromEntries(Object.entries(data).filter(([key]) => pick.includes(key)));
  }

  // Omit specific fields
  if (Array.isArray(omit)) {
    return Object.fromEntries(Object.entries(data).filter(([key]) => !omit.includes(key)));
  }

  return data;
};
/*Example usage 
In a controller (command)
res.status(201).json(successResponse());

In a controller (query)
res.status(200).json(successResponse(formatData(order)));

In errorHandler
res.status(error.statusCode).json(ErrorResponse(error));
 */
