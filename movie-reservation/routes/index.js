const express = require('express');
const router = express.Router();
const loadCinemas = require('../middleware/loadCinemas');

// GET / - Zobrazení úvodní stránky s výběrem kin
router.get('/', loadCinemas, (req, res) => {
  res.render('index', { cinemas: res.locals.cinemas });
});

module.exports = router;