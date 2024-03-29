const mongoose = require('mongoose');

const STSSchema = new mongoose.Schema({
  wardNumber: {
    type: Number,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  gpsCoordinates: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('STS', STSSchema);
