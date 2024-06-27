const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Movie = require('../models/movie');
const checkAdmin = require('../middleware/checkAdmin');
const loadCinemas = require('../middleware/loadCinemas');
const errorHandler = require('../middleware/errorHandler');

// Nastavení úložiště pro nahrávání souborů
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: storage });

// GET /movies - Získání všech filmů nebo filmů podle kina
router.get('/', loadCinemas, async (req, res, next) => {
  try {
    const query = req.query.cinemaId ? { 'showtimes.cinemaId': req.query.cinemaId } : {};
    const movies = await Movie.find(query).populate('showtimes.cinemaId');
    if (req.query.view === 'index') {
      res.json(movies);
    } else {
      res.render('movies', { movies: movies, cinemas: res.locals.cinemas });
    }
  } catch (err) {
    next(err);
  }
});

// GET /movies/:id - Zobrazení detailu filmu
router.get('/:id', loadCinemas, async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).populate('showtimes.cinemaId');
    if (!movie) {
      return res.status(404).json({ message: 'Film nenalezen' });
    }
    res.render('movieDetail', { movie: movie, cinemas: res.locals.cinemas });
  } catch (err) {
    next(err);
  }
});

// POST /movies - Vytvoření nového filmu (pouze pro adminy)
router.post('/', checkAdmin, upload.single('coverImage'), async (req, res, next) => {
  const movie = new Movie({
    title: req.body.title,
    description: req.body.description,
    coverImage: '/uploads/' + req.file.filename
  });

  try {
    const newMovie = await movie.save();
    res.redirect('/movies');
  } catch (err) {
    next(err);
  }
});

// POST /movies/:id/showtimes - Přidání nového promítacího času
router.post('/:id/showtimes', checkAdmin, async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Film nenalezen' });
    }
    movie.showtimes.push({
      date: new Date(req.body.date),
      time: req.body.time,
      cinemaId: req.body.cinemaId
    });
    await movie.save();
    res.redirect(`/movies/${movie._id}`);
  } catch (err) {
    next(err);
  }
});

// DELETE /movies/:id/showtimes/:index - Odebrání promítacího času
router.delete('/:id/showtimes/:index', checkAdmin, async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Film nenalezen' });
    }
    movie.showtimes.splice(req.params.index, 1);
    await movie.save();
    res.redirect(`/movies/${movie._id}`);
  } catch (err) {
    next(err);
  }
});

// DELETE /movies/:id - Smazání filmu
router.delete('/:id', checkAdmin, async (req, res, next) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect('/movies');
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;