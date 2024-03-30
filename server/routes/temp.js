
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vehicle = require('../models/vehicle');
const STS = require('../models/sts');
const Landfill = require('../models/landfill');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Assuming the existence of a '/optimize-route' GET route
router.get('/optimize-route', async (req, res) => {
    const { wardNumber, registrationNumber, landfillId } = req.query;

    try {
        // Find the vehicle by registrationNumber and wardNumber
        const vehicle = await Vehicle.findOne({
            registrationNumber: registrationNumber,
            wardNumber: wardNumber
        });

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // Find the STS record by wardNumber
        const sts = await STS.findOne({ wardNumber: wardNumber });

        if (!sts) {
            return res.status(404).json({ message: "STS not found" });
        }

        // Find the Landfill record by landfillId
        const landfill = await Landfill.findOne({ landfillId: landfillId });

        if (!landfill) {
            return res.status(404).json({ message: "Landfill not found" });
        }

        // Construct the payload for GraphHopper Route Optimization API
        const payload = {
            vehicles: [{
                vehicle_id: vehicle._id.toString(),
                type_id: 'bus',
                start_address: {
                    location_id: sts.locationId,
                    lon: sts.longitude,
                    lat: sts.latitude
                },
                max_jobs: 3
            }],
            vehicle_types: [{
                type_id: 'bus',
                capacity: [parseInt(vehicle.capacity)]
            }],
            shipments: [{
                id: uuidv4(),
                pickup: {
                    address: {
                        location_id: sts.locationId,
                        lon: sts.longitude,
                        lat: sts.latitude
                    }
                },
                delivery: {
                    address: {
                        location_id: landfill.locationId,
                        lon: landfill.longitude,
                        lat: landfill.latitude
                    }
                }
            }],
            objectives: [{
                type: 'min-max',
                value: 'vehicles'
            }, {
                type: 'min-max',
                value: 'completion_time'
            }],
            configuration: {
                routing: {
                    calc_points: true
                }
            }
        };

        // Here, instead of calling the GraphHopper API directly, we'll respond with the payload
        // In a real scenario, you would use `fetch` to send this payload to the GraphHopper API
        res.json(payload);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;




const lowestUserIdUser = await User.findOne({}, {}, { sort: { 'userId': 1 } });

        let userId;
        if (lowestUserIdUser && lowestUserIdUser < 0) {
            userId = lowestUserIdUser.userId -1;
        } else {
            userId = -1; // If no user found, set userId to 101
        }

const axios = require('axios');

// Define the URL you want to send the GET request to
const url = 'http://localhost:8080/api/distance?wardNumber=123&landfillId=456';

// Perform the GET request using Axios
axios.get(url)
  .then(response => {
    // Access the instructions from the first path in the response data
    const instructions = response.data.paths[0].instructions;
    if (instructions && instructions.length > 0) {
      // Iterate over each instruction to extract and log the distance and time
      instructions.forEach((instruction, index) => {
        const distance = instruction.distance;
        const time = instruction.time;
        
        // Log the distance and time for each instruction
        console.log(`Instruction ${index + 1}: Distance = ${distance}, Time = ${time}`);
      });
    } else {
      console.log('No instructions found in the response.');
    }
  })
  .catch(error => {
    // Handle any errors that occur during the request
    console.error('Error fetching data:', error.message);
  });
