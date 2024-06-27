const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const admins = require('./config/admins');
const app = express();

// Připojení k MongoDB databázi
mongoose.connect('mongodb+srv://vakkeh:R1nLg4S3Y9iXW7xq@movie-reservation.jcrraei.mongodb.net/?retryWrites=true&w=majority&appName=movie-reservation', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Připojeno k MongoDB');
}).catch((err) => {
  console.error('Chyba připojení k MongoDB:', err);
});

// Nastavení view enginu na EJS
app.set('view engine', 'ejs');

// Parsování JSON a URL-encoded dat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Použití statických souborů
app.use(express.static('public'));

// Použití cookie-parser
app.use(cookieParser());

// Použití method-override
app.use(methodOverride('_method'));

// Nastavení relací
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware pro kontrolu autentizace adminů
function checkAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Přihlašovací routa
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admin = admins.find(admin => admin.username === username && admin.password === password);
  if (admin) {
    req.session.admin = admin;
    res.redirect('/admin');
  } else {
    res.redirect('/login');
  }
});

// Odhlášení
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Import rout
const indexRouter = require('./routes/index');
const cinemasRouter = require('./routes/cinemas');
const moviesRouter = require('./routes/movies');
const reservationsRouter = require('./routes/reservations');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin'); // Import administrátorské routy

// Použití rout
app.use('/', indexRouter);
app.use('/cinemas', cinemasRouter);
app.use('/movies', moviesRouter);
app.use('/reservations', reservationsRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter); // Použití administrátorské routy

// Nastavení portu
const port = process.env.PORT || 3000;

// Spuštění serveru
app.listen(port, () => {
  console.log(`Server běží na portu ${port}`);
});
