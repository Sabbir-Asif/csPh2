// d7288894-e3e8-4a41-bb1a-a11c65dc1bb8
const express = require('express');
const router = express.Router();
const axios = require('axios');
const STS = require('../models/sts');
const Landfill = require('../models/landfill');

// Function to fetch coordinates of STS based on wardNumber
async function getSTSLocation(wardNumber) {
    const sts = await STS.findOne({ wardNumber });
    return { latitude: sts.latitude, longitude: sts.longitude };
}

// Function to fetch coordinates of landfill based on landfillId
async function getLandfillLocation(landfillId) {
    const landfill = await Landfill.findOne({ landfillId });
    return { latitude: landfill.latitude, longitude: landfill.longitude };
}

// Function to optimize route using GraphHopper API
async function optimizeRoute(startCoords, endCoords) {
  const url = `https://graphhopper.com/api/1/route?point=${startCoords.latitude},${startCoords.longitude}&point=${endCoords.latitude},${endCoords.longitude}&vehicle=car&locale=en&key=0981671d-e144-4a29-9ce0-812ff9084eaa`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching route:", error);
        throw error;
    }
}

// Route handler to optimize route between STS and landfill
router.get('/', async (req, res) => {
    const { wardNumber, landfillId } = req.query;
    try {
        // Fetch coordinates of STS and landfill
        const stsCoords = await getSTSLocation(wardNumber);
        const landfillCoords = await getLandfillLocation(landfillId);
        
        // Optimize route using GraphHopper API
        const optimizedRoute = await optimizeRoute(stsCoords, landfillCoords);

        // Respond with optimized route data
        res.json(optimizedRoute);
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
