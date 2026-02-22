const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  sourceStop: {
    stopId: String,
    name: String
  },
  destinationStop: {
    stopId: String,
    name: String
  },
  path: [{
    stopId: String,
    name: String,
    routeId: String,
    isInterchange: Boolean,
    arrivalTime: Date
  }],
  segments: [{
    routeId: String,
    routeName: String,
    routeColor: String,
    fromStop: String,
    toStop: String,
    stops: [String],
    travelTime: Number
  }],
  totalStops: Number,
  totalTravelTime: Number,
  totalTransfers: Number,
  qrString: {
    type: String,
    required: true,
    unique: true
  },
  qrHash: String,
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ qrString: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
