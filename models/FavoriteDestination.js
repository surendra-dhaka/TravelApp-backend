const mongoose = require('mongoose');

const favoriteDestinationSchema = new mongoose.Schema({
    city: { type: String, required: true },
    destinations: [{ type: String, required: true }],
});

module.exports = mongoose.model('FavoriteDestination', favoriteDestinationSchema);
