const express = require('express');
const axios = require('axios');
const router = express.Router();
const STS = require('../models/sts');
const Landfill = require('../models/landfill');

router.get('/calculate', async (req, res) => {
  const { wardNumber, landfillId } = req.query;
  
  try {
    // Find STS by wardNumber
    const sts = await STS.findOne({ wardNumber: parseInt(wardNumber) });
    if (!sts) return res.status(404).json({ message: 'STS not found' });

    // Find Landfill by landfillId
    const landfill = await Landfill.findOne({ landfillId: parseInt(landfillId) });
    if (!landfill) return res.status(404).json({ message: 'Landfill not found' });

    // Assuming the gpsCoordinates are stored in "lat,lon" format
    const stsCoords = sts.gpsCoordinates.replace('° N', '').replace('° E', '');
    const landfillCoords = landfill.gpsCoordinates.replace('° N', '').replace('° E', '');

    // Call GraphHopper API to calculate distance and time
    const response = await axios.get(`https://graphhopper.com/api/1/route`, {
      params: {
        point: [stsCoords, landfillCoords].join('|'),
        vehicle: 'car',
        locale: 'en',
        key: 'd7288894-e3e8-4a41-bb1a-a11c65dc1bb8',
      }
    });

    const path = response.data.paths[0];
    const distance = path.distance; // Distance in meters
    const time = path.time / 1000 / 60; // Convert time from milliseconds to minutes

    res.json({ 
      distance: distance.toFixed(2), // Format the distance if necessary
      time: time.toFixed(2)          // Format the time if necessary
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error calculating distance', error });
  }
});

module.exports = router;
