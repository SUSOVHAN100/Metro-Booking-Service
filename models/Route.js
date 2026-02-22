const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  stops: [{
    stopId: String,
    name: String,
    order: Number,
    travelTimeToNext: Number // in minutes
  }],
  totalStops: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate total stops
routeSchema.pre('save', function(next) {
  this.totalStops = this.stops.length;
  next();
});

module.exports = mongoose.model('Route', routeSchema);