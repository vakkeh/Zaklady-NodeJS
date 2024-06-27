const express = require('express');
const router = express.Router();
const User = require('../models/user');
const errorHandler = require('../middleware/errorHandler');

// GET /users - Získání všech uživatelů a zobrazení view
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find();
    res.render('users', { users: users });
  } catch (err) {
    next(err);
  }
});

// POST /users - Vytvoření nového uživatele
router.post('/', async (req, res, next) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  try {
    const newUser = await user.save();
    res.redirect('/users');
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;