module.exports = (req, res, next) => {
    if (!req.session.history) {
      req.session.history = [];
    }
    if (req.session.history.length === 0 || req.session.history[req.session.history.length - 1] !== req.originalUrl) {
      req.session.history.push(req.originalUrl);
    }
    res.locals.backUrl = req.session.history.length > 1 ? req.session.history[req.session.history.length - 2] : '/';
    next();
  };