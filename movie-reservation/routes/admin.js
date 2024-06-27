const express = require('express');
const router = express.Router();
const checkAdmin = require('../middleware/checkAdmin');

// GET /admin - Zobrazení administrátorské stránky
router.get('/', checkAdmin, (req, res) => {
  res.render('admin');
});

module.exports = router;