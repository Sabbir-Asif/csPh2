// Ensure to require necessary modules at the beginning of your fleet.js file
const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // For Node.js versions that don't support fetch natively
const Vehicle = require('../models/vehicle');
const STS = require('../models/sts');
const Landfill = require('../models/landfill');
const Bills = require('../models/bill'); // Assuming this is the path to your Bill model
const { v4: uuidv4 } = require('uuid');

router.post('/', async (req, res) => {
    // Destructure the required attributes from req.body
    const { registrationNumber, wardNumber, landfillId, arrivalTime, departureTime, weight } = req.body;

    try {
        const vehicle = await Vehicle.findOne({ registrationNumber, wardNumber });
        const sts = await STS.findOne({ wardNumber });
        const landfill = await Landfill.findOne({ landfillId });

        if (!vehicle || !sts || !landfill) {
            return res.status(404).json({ message: "Required entities not found" });
        }

        // Adjusted payload to use information from req.body and models
        const payload = {
            vehicles: [{
                vehicle_id: vehicle._id.toString(),
                type_id: 'bus', // Adjust type_id according to your application logic
                start_address: {
                    location_id: sts.locationId,
                    lon: sts.longitude,
                    lat: sts.latitude
                },
                max_jobs: 3, // Example max_jobs
                earliest_start: Date.parse(arrivalTime), // Convert to timestamp
                latest_end: Date.parse(departureTime), // Convert to timestamp
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
                type: 'min',
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

        const query = new URLSearchParams({ key: '0981671d-e144-4a29-9ce0-812ff9084eaa' }).toString();
        const graphHopperResponse = await fetch(`https://graphhopper.com/api/1/vrp?${query}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const graphHopperData = await graphHopperResponse.json();

        // Assuming distance and time are directly available in the graphHopperData (adjust according to actual API response)
        const distanceKm = graphHopperData.solution.distance / 1000; // Example conversion to km
        const timeHours = graphHopperData.solution.time / 3600; // Example conversion to hours

        const costPerKm = vehicle.fuelCostUnloaded + ((weight / vehicle.capacity) * (vehicle.fuelCostFullyLoaded - vehicle.fuelCostUnloaded));
        const cost = distanceKm * costPerKm; // Example cost calculation

        const highestBill = await Bills.findOne({}, {}, { sort: { 'billId': -1 } });
    let billId;
    if (highestBill && highestBill.billId > 0) {
        billId = parseInt(highestBill.billId) + 1;
    }
    else{
        billId = 1;
    }
        // Generate a new bill with the calculated cost
        const newBill = new Bills({
            billId: billId,
            registrationNumber,
            wardNumber,
            arrivalTime: new Date(arrivalTime),
            departureTime: new Date(departureTime),
            stsLocationId: sts.locationId,
            landfillLocationId: landfill.locationId,
            distance: distanceKm,
            time: timeHours,
            weight,
            costPerKm,
            cost,
            // Add any additional fields as required
        });

        const savedBill = await newBill.save();
        res.status(201).json(savedBill);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing the request." });
    }
});

module.exports = router;
