const express = require('express');
const router = express.Router();
const {
    searchDestinations,
    addFavoriteDestination,
    removeFavoriteDestination,
    getFavoriteDestinations,
} = require('../controllers/travelController');

router.get('/search/:city', searchDestinations);
router.post('/favorites', addFavoriteDestination);
router.delete('/favorites', removeFavoriteDestination);
router.get('/favorites', getFavoriteDestinations);

module.exports = router;
