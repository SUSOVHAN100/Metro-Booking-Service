const express = require('express');
const router = express.Router();
const Stop = require('../models/Stop');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Get all stops
router.get('/', async (req, res) => {
  try {
    const stops = await Stop.find();
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stop by ID
router.get('/:stopId', async (req, res) => {
  try {
    const stop = await Stop.findOne({ stopId: req.params.stopId });
    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    res.json(stop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new stop
router.post('/', async (req, res) => {
  try {
    const stop = new Stop(req.body);
    await stop.save();
    res.status(201).json(stop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update stop
router.put('/:stopId', async (req, res) => {
  try {
    const stop = await Stop.findOneAndUpdate(
      { stopId: req.params.stopId },
      req.body,
      { new: true }
    );
    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    res.json(stop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete stop
router.delete('/:stopId', async (req, res) => {
  try {
    const stop = await Stop.findOneAndDelete({ stopId: req.params.stopId });
    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }
    res.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk upload stops via CSV
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const results = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const stops = await Stop.insertMany(results);
        fs.unlinkSync(req.file.path); // Clean up
        res.status(201).json(stops);
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;