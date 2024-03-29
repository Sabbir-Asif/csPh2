const express = require('express');
const router = express.Router();
const STS = require('../models/sts');

// Route to create a new STS
router.post('/', async (req, res) => {
  try {
    const { wardNumber, capacity, gpsCoordinates } = req.body;
    const newSTS = new STS({ wardNumber, capacity, gpsCoordinates });
    const savedSTS = await newSTS.save();
    res.status(201).json(savedSTS);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
