const axios = require('axios');
const FavoriteDestination = require('../models/FavoriteDestination');
const dotenv = require('dotenv');

dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error('Missing API key. Please set the OPENAI_API_KEY environment variable.');
  }
const searchDestinations = async (req, res) => {
    const { city } = req.params;
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content:`List popular travel destinations in ${city}`
              }
            ],
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        
        console.log('OpenAI API response:', response.data);

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const destinations = response.data.choices[0].message.content.trim().split('\n');
            res.json({ city, destinations });
        } else {
            throw new Error('Unexpected response format from OpenAI API');
        }
    } catch (error) {
        console.error('Error fetching destinations:', error.message);
        if (error.response && error.response.status === 429) {
            res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
        } else {
            res.status(500).json({ message: 'Error fetching destinations', error: error.message });
        }
    }
};

const addFavoriteDestination = async (req, res) => {
    const { city, destinations } = req.body;
    try {
        let favorite = await FavoriteDestination.findOne({ city });
        if (!favorite) {
            favorite = new FavoriteDestination({ city, destinations });
        } else {
            favorite.destinations.push(...destinations);
            favorite.destinations = [...new Set(favorite.destinations)]; // Remove duplicates
        }
        await favorite.save();
        res.json(favorite);
    } catch (error) {
        res.status(500).json({ message: 'Error adding favorite destination', error });
    }
};

const removeFavoriteDestination = async (req, res) => {
    const { city, destination } = req.body;
    try {
        const favorite = await FavoriteDestination.findOne({ city });
        if (favorite) {
            favorite.destinations = favorite.destinations.filter(dest => dest !== destination);
            if (favorite.destinations.length === 0) {
                await FavoriteDestination.deleteOne({ city });
            } else {
                await favorite.save();
            }
            res.json(favorite);
        } else {
            res.status(404).json({ message: 'City not found in favorites' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error removing favorite destination', error });
    }
};

const getFavoriteDestinations = async (req, res) => {
    try {
        const favorites = await FavoriteDestination.find();
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorite destinations', error });
    }
};

module.exports = {
    searchDestinations,
    addFavoriteDestination,
    removeFavoriteDestination,
    getFavoriteDestinations,
};
