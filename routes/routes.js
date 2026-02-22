const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const graphService = require('../services/graphService');

// Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get route by ID
router.get('/:routeId', async (req, res) => {
  try {
    const route = await Route.findOne({ routeId: req.params.routeId });
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new route
router.post('/', async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    
    // Refresh graph
    await graphService.refreshGraph();
    
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update route
router.put('/:routeId', async (req, res) => {
  try {
    const route = await Route.findOneAndUpdate(
      { routeId: req.params.routeId },
      req.body,
      { new: true }
    );
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    // Refresh graph
    await graphService.refreshGraph();
    
    res.json(route);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete route
router.delete('/:routeId', async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({ routeId: req.params.routeId });
    
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    
    // Refresh graph
    await graphService.refreshGraph();
    
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get graph representation
router.get('/graph/visualize', async (req, res) => {
  try {
    const graph = await graphService.getGraph() || await graphService.buildGraph();
    res.json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh graph
router.post('/graph/refresh', async (req, res) => {
  try {
    const graph = await graphService.refreshGraph();
    res.json({ message: 'Graph refreshed successfully', graph });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;