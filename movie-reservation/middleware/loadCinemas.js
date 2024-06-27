const Cinema = require('../models/cinema');

module.exports = async (req, res, next) => {
  try {
    res.locals.cinemas = await Cinema.find();
    next();
  } catch (err) {
    next(err);
  }
};