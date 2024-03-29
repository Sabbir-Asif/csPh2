const express = require('express');
const router = express.Router();
const Landfill = require('../models/landfill');

// Route to create a new Landfill
router.post('/', async (req, res) => {
  try {
    // Extracting data from the request body
    const { landfillId, longitude, latitude } = req.body;

    // Creating a new Landfill instance
    const newLandfill = new Landfill({
      landfillId,
      longitude,
      latitude
    });

    // Saving the new Landfill instance to the database
    const savedLandfill = await newLandfill.save();

    // Responding with the saved Landfill data
    res.status(201).json(savedLandfill);
  } catch (error) {
    // Handling errors
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
