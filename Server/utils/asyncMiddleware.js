
export const asyncMiddleware = (fn) => (req, res, next) => {
  try {
    const result = fn(req, res, next);
    if (result && result.catch) {
      result.catch(next);
    }
  } catch (err) {
    next(err);
  }
};
