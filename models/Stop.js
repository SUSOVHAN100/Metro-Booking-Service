const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  stopId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  routes: [{
    type: String,
    ref: 'Route'
  }],
  isInterchange: {
    type: Boolean,
    default: false
  },
  location: {
    lat: Number,
    lng: Number
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to set isInterchange
stopSchema.pre('save', function(next) {
  this.isInterchange = this.routes && this.routes.length > 1;
  next();
});

module.exports = mongoose.model('Stop', stopSchema);