const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Reservation = require('../models/reservation');
const Movie = require('../models/movie');
const errorHandler = require('../middleware/errorHandler');

// Middleware pro nastavení cookies
router.use((req, res, next) => {
  if (!req.cookies.userId) {
    res.cookie('userId', new mongoose.Types.ObjectId().toString(), { maxAge: 900000, httpOnly: true });
  }
  next();
});

// GET /reservations - Získání všech rezervací a zobrazení view
router.get('/', async (req, res, next) => {
  try {
    const userId = req.cookies.userId;
    const reservations = await Reservation.find({ userId: userId }).populate('movieId');
    res.render('reservations', { reservations: reservations });
  } catch (err) {
    next(err);
  }
});

// GET /reservations/new - Zobrazení formuláře pro novou rezervaci
router.get('/new', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.query.movieId).populate('showtimes.cinemaId');
    res.render('newReservation', { movie: movie, date: req.query.date, time: req.query.time });
  } catch (err) {
    next(err);
  }
});

// POST /reservations - Vytvoření nové rezervace
router.post('/', async (req, res, next) => {
  const userId = req.cookies.userId;
  const reservation = new Reservation({
    userId: userId,
    movieId: req.body.movieId,
    date: req.body.date,
    time: req.body.time,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });

  try {
    const newReservation = await reservation.save();

    // Načtení filmu a kina
    const movie = await Movie.findById(newReservation.movieId).populate('showtimes.cinemaId');

    // Generování QR kódu
    const qrCodeUrl = `http://localhost:3000/reservations/${newReservation._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeUrl);
    newReservation.qrCode = qrCode;
    await newReservation.save();

    // Generování PDF vstupenky
    const doc = new PDFDocument({ lang: 'cs' });
    const filePath = `public/tickets/${newReservation._id}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    doc.font('public/fonts/DejaVuSans.ttf').fontSize(25).text('Vstupenka', { align: 'center' });
    doc.fontSize(16).text(`Film: ${movie.title}`, { align: 'left' });
    doc.text(`Kino: ${movie.showtimes.find(showtime => showtime.date.toISOString() === newReservation.date.toISOString() && showtime.time === newReservation.time).cinemaId.name}`, { align: 'left' });
    doc.text(`Datum: ${newReservation.date.toDateString()}`, { align: 'left' });
    doc.text(`Čas: ${newReservation.time}`, { align: 'left' });
    doc.image(qrCode, { fit: [100, 100], align: 'center' });

    doc.end();

    res.redirect('/reservations');
  } catch (err) {
    next(err);
  }
});

// DELETE /reservations/:id - Smazání rezervace
router.delete('/:id', async (req, res, next) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.redirect('/reservations');
  } catch (err) {
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;