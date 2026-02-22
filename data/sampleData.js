module.exports = {
  stops: [
    // Yellow Line Stops
    {
      stopId: 'S001',
      name: 'Rajiv Chowk',
      routes: ['R001', 'R002'],
      isInterchange: true,
      location: { lat: 28.6328, lng: 77.2197 },
      zone: 'Central',
      facilities: ['Elevator', 'Escalator', 'Parking', 'ATM', 'Food Court'],
      openingTime: '05:00',
      closingTime: '23:30'
    },
    {
      stopId: 'S002',
      name: 'Karol Bagh',
      routes: ['R001'],
      isInterchange: false,
      location: { lat: 28.6454, lng: 77.1906 },
      zone: 'Central',
      facilities: ['Elevator', 'Parking'],
      openingTime: '05:30',
      closingTime: '23:00'
    },
    {
      stopId: 'S003',
      name: 'Jhandewalan',
      routes: ['R001'],
      isInterchange: false,
      location: { lat: 28.6523, lng: 77.1854 },
      zone: 'Central',
      facilities: ['Elevator'],
      openingTime: '05:45',
      closingTime: '22:45'
    },
    {
      stopId: 'S004',
      name: 'R K Ashram',
      routes: ['R001'],
      isInterchange: false,
      location: { lat: 28.6598, lng: 77.1789 },
      zone: 'Central',
      facilities: ['Elevator', 'ATM'],
      openingTime: '06:00',
      closingTime: '22:30'
    },
    // Blue Line Stops
    {
      stopId: 'S005',
      name: 'Barakhamba',
      routes: ['R002'],
      isInterchange: false,
      location: { lat: 28.6312, lng: 77.2245 },
      zone: 'Central',
      facilities: ['Elevator', 'Escalator', 'ATM'],
      openingTime: '05:15',
      closingTime: '23:15'
    },
    {
      stopId: 'S006',
      name: 'Mandi House',
      routes: ['R002', 'R003'],
      isInterchange: true,
      location: { lat: 28.6254, lng: 77.2367 },
      zone: 'Central',
      facilities: ['Elevator', 'Escalator', 'Food Court', 'ATM'],
      openingTime: '05:00',
      closingTime: '23:45'
    },
    {
      stopId: 'S007',
      name: 'Pragati Maidan',
      routes: ['R003'],
      isInterchange: false,
      location: { lat: 28.6189, lng: 77.2456 },
      zone: 'Central',
      facilities: ['Elevator', 'Parking'],
      openingTime: '06:30',
      closingTime: '22:00'
    },
    // Additional Stops
    {
      stopId: 'S008',
      name: 'Kashmere Gate',
      routes: ['R001', 'R004', 'R005'],
      isInterchange: true,
      location: { lat: 28.6678, lng: 77.2345 },
      zone: 'North',
      facilities: ['Elevator', 'Escalator', 'Parking', 'ATM', 'Food Court', 'Metro Mall'],
      openingTime: '04:45',
      closingTime: '23:59'
    },
    {
      stopId: 'S009',
      name: 'Chandni Chowk',
      routes: ['R001'],
      isInterchange: false,
      location: { lat: 28.6723, lng: 77.2278 },
      zone: 'North',
      facilities: ['Elevator', 'Escalator'],
      openingTime: '05:30',
      closingTime: '22:30'
    },
    {
      stopId: 'S010',
      name: 'Chawri Bazar',
      routes: ['R001'],
      isInterchange: false,
      location: { lat: 28.6765, lng: 77.2212 },
      zone: 'North',
      facilities: ['Elevator'],
      openingTime: '05:45',
      closingTime: '22:15'
    },
    {
      stopId: 'S011',
      name: 'New Delhi',
      routes: ['R001', 'R006'],
      isInterchange: true,
      location: { lat: 28.6412, lng: 77.2198 },
      zone: 'Central',
      facilities: ['Elevator', 'Escalator', 'Parking', 'ATM', 'Airport Connection'],
      openingTime: '04:30',
      closingTime: '23:59'
    },
    {
      stopId: 'S012',
      name: 'AIIMS',
      routes: ['R002'],
      isInterchange: false,
      location: { lat: 28.5976, lng: 77.2123 },
      zone: 'South',
      facilities: ['Elevator', 'ATM', 'Hospital Connect'],
      openingTime: '06:00',
      closingTime: '22:00'
    },
    {
      stopId: 'S013',
      name: 'Green Park',
      routes: ['R002'],
      isInterchange: false,
      location: { lat: 28.5875, lng: 77.2056 },
      zone: 'South',
      facilities: ['Elevator', 'Escalator'],
      openingTime: '06:15',
      closingTime: '21:45'
    },
    {
      stopId: 'S014',
      name: 'Hauz Khas',
      routes: ['R002', 'R007'],
      isInterchange: true,
      location: { lat: 28.5789, lng: 77.1987 },
      zone: 'South',
      facilities: ['Elevator', 'Escalator', 'Parking', 'ATM', 'Food Court'],
      openingTime: '05:45',
      closingTime: '23:00'
    },
    {
      stopId: 'S015',
      name: 'Malviya Nagar',
      routes: ['R007'],
      isInterchange: false,
      location: { lat: 28.5687, lng: 77.1894 },
      zone: 'South',
      facilities: ['Elevator', 'Parking'],
      openingTime: '06:30',
      closingTime: '22:30'
    },
    {
      stopId: 'S016',
      name: 'Saket',
      routes: ['R007'],
      isInterchange: false,
      location: { lat: 28.5589, lng: 77.1802 },
      zone: 'South',
      facilities: ['Elevator', 'Escalator', 'ATM', 'Shopping Mall Connect'],
      openingTime: '06:00',
      closingTime: '23:00'
    },
    {
      stopId: 'S017',
      name: 'Qutub Minar',
      routes: ['R007'],
      isInterchange: false,
      location: { lat: 28.5498, lng: 77.1715 },
      zone: 'South',
      facilities: ['Elevator', 'Tourist Info'],
      openingTime: '07:00',
      closingTime: '21:00'
    },
    {
      stopId: 'S018',
      name: 'Dwarka Sector 21',
      routes: ['R004', 'R008'],
      isInterchange: true,
      location: { lat: 28.5892, lng: 77.0456 },
      zone: 'West',
      facilities: ['Elevator', 'Escalator', 'Parking', 'ATM', 'Airport Express'],
      openingTime: '04:00',
      closingTime: '23:59'
    },
    {
      stopId: 'S019',
      name: 'Aerocity',
      routes: ['R008'],
      isInterchange: false,
      location: { lat: 28.5678, lng: 77.1234 },
      zone: 'West',
      facilities: ['Elevator', 'Escalator', 'Hotel Shuttle'],
      openingTime: '05:00',
      closingTime: '23:30'
    },
    {
      stopId: 'S020',
      name: 'IGI Airport',
      routes: ['R008'],
      isInterchange: false,
      location: { lat: 28.5567, lng: 77.0987 },
      zone: 'West',
      facilities: ['Elevator', 'Escalator', 'Baggage', 'Flight Info', 'Hotel Booking'],
      openingTime: '04:30',
      closingTime: '00:00'
    }
  ],
  
  routes: [
    {
      routeId: 'R001',
      name: 'Yellow Line',
      color: '#FFD700',
      lineCode: 'YL',
      totalDistance: '49.3 km',
      totalStops: 37,
      frequency: '2-5 minutes',
      firstTrain: '05:30',
      lastTrain: '23:15',
      stops: [
        { stopId: 'S001', name: 'Rajiv Chowk', order: 10, travelTimeToNext: 3 },
        { stopId: 'S002', name: 'Karol Bagh', order: 11, travelTimeToNext: 2 },
        { stopId: 'S003', name: 'Jhandewalan', order: 12, travelTimeToNext: 2 },
        { stopId: 'S004', name: 'R K Ashram', order: 13, travelTimeToNext: 3 },
        { stopId: 'S008', name: 'Kashmere Gate', order: 8, travelTimeToNext: 3 },
        { stopId: 'S009', name: 'Chandni Chowk', order: 9, travelTimeToNext: 2 },
        { stopId: 'S010', name: 'Chawri Bazar', order: 10, travelTimeToNext: 2 },
        { stopId: 'S011', name: 'New Delhi', order: 11, travelTimeToNext: 3 }
      ]
    },
    {
      routeId: 'R002',
      name: 'Blue Line',
      color: '#0000FF',
      lineCode: 'BL',
      totalDistance: '56.5 km',
      totalStops: 50,
      frequency: '3-6 minutes',
      firstTrain: '05:45',
      lastTrain: '23:00',
      stops: [
        { stopId: 'S001', name: 'Rajiv Chowk', order: 15, travelTimeToNext: 2 },
        { stopId: 'S005', name: 'Barakhamba', order: 16, travelTimeToNext: 2 },
        { stopId: 'S006', name: 'Mandi House', order: 17, travelTimeToNext: 3 },
        { stopId: 'S012', name: 'AIIMS', order: 22, travelTimeToNext: 3 },
        { stopId: 'S013', name: 'Green Park', order: 23, travelTimeToNext: 2 },
        { stopId: 'S014', name: 'Hauz Khas', order: 24, travelTimeToNext: 0 }
      ]
    },
    {
      routeId: 'R003',
      name: 'Violet Line',
      color: '#EE82EE',
      lineCode: 'VL',
      totalDistance: '38.2 km',
      totalStops: 34,
      frequency: '4-7 minutes',
      firstTrain: '06:00',
      lastTrain: '22:45',
      stops: [
        { stopId: 'S006', name: 'Mandi House', order: 5, travelTimeToNext: 3 },
        { stopId: 'S007', name: 'Pragati Maidan', order: 6, travelTimeToNext: 2 },
        { stopId: 'S011', name: 'New Delhi', order: 4, travelTimeToNext: 2 }
      ]
    },
    {
      routeId: 'R004',
      name: 'Blue Line Branch',
      color: '#4169E1',
      lineCode: 'BLB',
      totalDistance: '15.8 km',
      totalStops: 12,
      frequency: '5-8 minutes',
      firstTrain: '06:15',
      lastTrain: '22:30',
      stops: [
        { stopId: 'S008', name: 'Kashmere Gate', order: 1, travelTimeToNext: 4 },
        { stopId: 'S018', name: 'Dwarka Sector 21', order: 12, travelTimeToNext: 0 }
      ]
    },
    {
      routeId: 'R005',
      name: 'Red Line',
      color: '#FF0000',
      lineCode: 'RL',
      totalDistance: '34.7 km',
      totalStops: 29,
      frequency: '3-5 minutes',
      firstTrain: '05:30',
      lastTrain: '23:30',
      stops: [
        { stopId: 'S008', name: 'Kashmere Gate', order: 15, travelTimeToNext: 3 },
        { stopId: 'S009', name: 'Chandni Chowk', order: 14, travelTimeToNext: 2 }
      ]
    },
    {
      routeId: 'R006',
      name: 'Orange Line (Airport Express)',
      color: '#FFA500',
      lineCode: 'OL',
      totalDistance: '22.7 km',
      totalStops: 6,
      frequency: '10 minutes',
      firstTrain: '04:45',
      lastTrain: '23:30',
      stops: [
        { stopId: 'S011', name: 'New Delhi', order: 1, travelTimeToNext: 5 },
        { stopId: 'S019', name: 'Aerocity', order: 4, travelTimeToNext: 3 },
        { stopId: 'S020', name: 'IGI Airport', order: 5, travelTimeToNext: 0 }
      ]
    },
    {
      routeId: 'R007',
      name: 'Magenta Line',
      color: '#FF00FF',
      lineCode: 'ML',
      totalDistance: '37.4 km',
      totalStops: 25,
      frequency: '4-6 minutes',
      firstTrain: '06:00',
      lastTrain: '22:00',
      stops: [
        { stopId: 'S014', name: 'Hauz Khas', order: 12, travelTimeToNext: 3 },
        { stopId: 'S015', name: 'Malviya Nagar', order: 13, travelTimeToNext: 2 },
        { stopId: 'S016', name: 'Saket', order: 14, travelTimeToNext: 2 },
        { stopId: 'S017', name: 'Qutub Minar', order: 15, travelTimeToNext: 0 }
      ]
    },
    {
      routeId: 'R008',
      name: 'Airport Express Link',
      color: '#FFB347',
      lineCode: 'AEL',
      totalDistance: '15.2 km',
      totalStops: 4,
      frequency: '15 minutes',
      firstTrain: '05:00',
      lastTrain: '23:00',
      stops: [
        { stopId: 'S018', name: 'Dwarka Sector 21', order: 1, travelTimeToNext: 4 },
        { stopId: 'S019', name: 'Aerocity', order: 2, travelTimeToNext: 3 },
        { stopId: 'S020', name: 'IGI Airport', order: 3, travelTimeToNext: 0 }
      ]
    }
  ],
  
  // Additional sample data for fares
  fareChart: {
    baseFare: 10,
    perKmRate: 2.5,
    maxFare: 60,
    discounts: {
      student: 0.3,
      senior: 0.4,
      daily: 0.1
    }
  },
  
  // Train schedule data
  trainSchedule: {
    peakHours: ['08:00-11:00', '17:00-20:00'],
    offPeakFrequency: 7,
    peakFrequency: 3,
    trainCapacity: 1200
  },
  
  // Popular routes
  popularRoutes: [
    { from: 'S001', to: 'S008', count: 1250 },
    { from: 'S011', to: 'S020', count: 980 },
    { from: 'S006', to: 'S014', count: 750 },
    { from: 'S018', to: 'S020', count: 600 }
  ]
};
