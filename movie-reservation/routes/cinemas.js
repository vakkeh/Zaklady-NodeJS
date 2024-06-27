const express = require('express');
const router = express.Router();
const Cinema = require('../models/cinema');
const checkAdmin = require('../middleware/checkAdmin');
const errorHandler = require('../middleware/errorHandler');

// GET /cinemas - Získání všech kin a zobrazení view
router.get('/', async (req, res, next) => {
  try {
    const cinemas = await Cinema.find();
    res.render('cinemas', { cinemas: cinemas });
  } catch (err) {
    next(err);
  }
});

// POST /cinemas - Vytvoření nového kina (pouze pro adminy)
router.post('/', checkAdmin, async (req, res, next) => {
  const cinema = new Cinema({
    name: req.body.name,
    location: req.body.location
  });

  try {
    const newCinema = await cinema.save();
    res.redirect('/cinemas');
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;