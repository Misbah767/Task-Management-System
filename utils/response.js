export const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
    data: data || {},
  };
  res.status(statusCode).json(response);
};

export const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    errors: errors || {},
  };
  res.status(statusCode).json(response);
};

export const sendPaginatedResponse = (
  res,
  statusCode,
  message,
  pagination,
  data
) => {
  const response = {
    success: true,
    message,
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      hasNext: pagination.hasNext,
      hasPrevious: pagination.hasPrevious,
    },
    data,
  };
  res.status(statusCode).json(response);
};
