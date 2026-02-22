const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class QRGenerator {
  constructor() {
    // Use environment variable for secret key in production
    this.secretKey = process.env.QR_SECRET_KEY || 'metro-booking-secret-key-change-in-production';
  }

  generateBookingQR(bookingData) {
    const {
      bookingId,
      userId,
      sourceStop,
      destinationStop,
      timestamp = new Date().toISOString()
    } = bookingData;
    
    // Create a unique string for QR with all relevant data
    const baseString = `${bookingId}|${userId}|${sourceStop.stopId}|${destinationStop.stopId}|${timestamp}`;
    
    // Generate hash for tamper resistance with timestamp to prevent replay attacks
    const hash = crypto.createHmac('sha256', this.secretKey)
      .update(baseString)
      .digest('hex')
      .substring(0, 12); // Increased hash length for better security
    
    // Create final QR string with version for future compatibility
    const qrString = `METROV1|${bookingId}|${hash}|${timestamp}|${userId.substring(0, 4)}`;
    
    // Generate QR code data URL (for direct display)
    const qrDataUrl = this.generateQRDataURL(qrString);
    
    return {
      qrString,
      qrDataUrl,
      hash,
      bookingId,
      timestamp,
      userId,
      sourceStop: sourceStop.name,
      destinationStop: destinationStop.name
    };
  }
  
  generateQRDataURL(qrString) {
    // In a real implementation, you'd use a library like 'qrcode'
    // For now, return a placeholder that will be replaced by frontend QR generation
    return `QR:${qrString}`;
  }
  
  validateQR(qrString) {
    try {
      const parts = qrString.split('|');
      
      // Check format and version
      if (parts[0] !== 'METROV1' || parts.length !== 5) {
        return { 
          valid: false, 
          reason: 'Invalid QR format or version mismatch',
          code: 'INVALID_FORMAT'
        };
      }
      
      const [, bookingId, hash, timestamp, userIdPrefix] = parts;
      
      // Check if QR is expired (optional - e.g., valid for 24 hours)
      const qrTime = new Date(timestamp);
      const now = new Date();
      const hoursDiff = (now - qrTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return { 
          valid: false, 
          reason: 'QR code has expired',
          code: 'EXPIRED'
        };
      }
      
      // In a real implementation, you'd retrieve the booking from database
      // and verify the hash with the actual data
      
      return {
        valid: true,
        bookingId,
        timestamp,
        userIdPrefix,
        verified: true
      };
    } catch (error) {
      console.error('QR validation error:', error);
      return { 
        valid: false, 
        reason: 'Invalid QR string',
        code: 'PARSE_ERROR'
      };
    }
  }
  
  async validateBookingQR(qrString, Booking) {
    try {
      // First validate format
      const validation = this.validateQR(qrString);
      if (!validation.valid) {
        return validation;
      }
      
      // Check if booking exists in database
      const booking = await Booking.findOne({ 
        bookingId: validation.bookingId,
        status: { $ne: 'cancelled' }
      });
      
      if (!booking) {
        return { 
          valid: false, 
          reason: 'Booking not found or cancelled',
          code: 'BOOKING_NOT_FOUND'
        };
      }
      
      // Verify hash with actual booking data
      const expectedHash = crypto.createHmac('sha256', this.secretKey)
        .update(`${booking.bookingId}|${booking.userId}|${booking.sourceStop.stopId}|${booking.destinationStop.stopId}|${booking.createdAt.toISOString()}`)
        .digest('hex')
        .substring(0, 12);
      
      if (validation.hash !== expectedHash) {
        return { 
          valid: false, 
          reason: 'QR tampering detected',
          code: 'TAMPERED'
        };
      }
      
      return {
        valid: true,
        booking,
        verified: true
      };
    } catch (error) {
      console.error('Booking validation error:', error);
      return { 
        valid: false, 
        reason: 'Validation error',
        code: 'VALIDATION_ERROR'
      };
    }
  }
  
  generateBookingId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().substring(0, 6).toUpperCase();
    return `METRO${timestamp}${random}`;
  }
  
  // Generate a scannable format for mobile apps
  generateScanFormat(booking) {
    return {
      type: 'METRO_TICKET',
      version: '1.0',
      data: {
        bookingId: booking.bookingId,
        source: booking.sourceStop.name,
        destination: booking.destinationStop.name,
        travelTime: booking.totalTravelTime,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        segments: booking.segments.map(s => ({
          route: s.routeName,
          from: s.fromStop,
          to: s.toStop,
          stops: s.stops.length
        }))
      }
    };
  }
}

module.exports = new QRGenerator();