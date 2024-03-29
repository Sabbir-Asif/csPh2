const express = require('express');
const router = express.Router();
const Landfill = require('../models/landfill');

// Route to create a new Landfill
router.post('/', async (req, res) => {
  try {
    const { landfillId, gpsCoordinates } = req.body;
    const newLandfill = new Landfill({ landfillId, gpsCoordinates });
    const savedLandfill = await newLandfill.save();
    res.status(201).json(savedLandfill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
