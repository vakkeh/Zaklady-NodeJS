const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: String,
  showtimes: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);