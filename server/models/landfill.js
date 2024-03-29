const mongoose = require('mongoose');

const LandfillSchema = new mongoose.Schema({
  landfillId: {
    type: Number,
    required: true,
  },
  gpsCoordinates: {
    type: String,
    required: true,
  },
  // Add other fields such as capacity, operational timespan, etc. as needed.
});

module.exports = mongoose.model('Landfill', LandfillSchema);
