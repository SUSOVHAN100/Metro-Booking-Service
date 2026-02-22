const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Stop = require('../models/Stop');
const pathOptimizer = require('../services/pathOptimizer');
const qrGenerator = require('../services/qrGenerator');

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { userId, sourceStopId, destinationStopId, optimizationStrategy } = req.body;
    
    // Validate stops
    const sourceStop = await Stop.findOne({ stopId: sourceStopId });
    const destStop = await Stop.findOne({ stopId: destinationStopId });
    
    if (!sourceStop || !destStop) {
      return res.status(400).json({ 
        error: 'Invalid source or destination stop',
        sourceExists: !!sourceStop,
        destExists: !!destStop
      });
    }
    
    // Find optimal path
    const pathResult = await pathOptimizer.findOptimalPath(
      sourceStopId, 
      destinationStopId,
      optimizationStrategy || 'minTime'
    );
    
    if (!pathResult) {
      return res.status(404).json({ 
        error: 'No path found between the selected stops',
        source: sourceStop.name,
        destination: destStop.name
      });
    }
    
    // Generate booking ID
    const bookingId = qrGenerator.generateBookingId();
    
    // Generate QR string
    const qrData = qrGenerator.generateBookingQR({
      bookingId,
      userId,
      sourceStop: sourceStop.name,
      destinationStop: destStop.name
    });
    
    // Create booking
    const booking = new Booking({
      bookingId,
      userId,
      sourceStop: {
        stopId: sourceStopId,
        name: sourceStop.name
      },
      destinationStop: {
        stopId: destinationStopId,
        name: destStop.name
      },
      path: pathResult.path.map(stopId => ({
        stopId,
        name: stopId, // Would need to fetch stop names
        routeId: null, // Would need to determine route for each stop
        isInterchange: false
      })),
      segments: pathResult.segments,
      totalStops: pathResult.totalStops,
      totalTravelTime: pathResult.totalTravelTime,
      totalTransfers: pathResult.totalTransfers,
      qrString: qrData.qrString,
      qrHash: qrData.hash
    });
    
    await booking.save();
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      qrData: {
        qrString: qrData.qrString,
        bookingId: qrData.bookingId
      }
    });
    
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by ID
router.get('/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Validate QR string
router.post('/validate-qr', async (req, res) => {
  try {
    const { qrString } = req.body;
    const validation = qrGenerator.validateQR(qrString);
    
    if (validation.valid) {
      const booking = await Booking.findOne({ bookingId: validation.bookingId });
      res.json({
        valid: true,
        booking,
        validation
      });
    } else {
      res.json(validation);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.put('/:bookingId/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.bookingId },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;