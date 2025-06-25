function sendError(res, status, message, details = null) {
  const error = { error: message };
  if (details) error.details = details;
  return res.status(status).json(error);
}

module.exports = { sendError };
