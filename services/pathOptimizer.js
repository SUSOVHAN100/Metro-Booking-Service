const graphService = require('./graphService');

class PathOptimizer {
  constructor() {
    this.transferPenalty = 5; // minutes penalty for each transfer
  }

  async findOptimalPath(sourceId, destinationId, optimizationStrategy = 'minTime') {
    const graph = await graphService.getGraph() || await graphService.buildGraph();
    
    if (sourceId === destinationId) {
      return {
        path: [sourceId],
        totalStops: 0,
        totalTravelTime: 0,
        totalTransfers: 0,
        segments: []
      };
    }

    // Dijkstra's algorithm implementation
    const distances = {};
    const previous = {};
    const routeAtNode = {};
    const transfers = {};
    const unvisited = new Set();
    
    // Initialize distances
    Object.keys(graph.nodes).forEach(nodeId => {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
      routeAtNode[nodeId] = null;
      transfers[nodeId] = 0;
      unvisited.add(nodeId);
    });
    
    distances[sourceId] = 0;
    
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current = null;
      let minDistance = Infinity;
      
      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          current = nodeId;
        }
      }
      
      if (current === null || current === destinationId) break;
      
      unvisited.delete(current);
      
      // Explore neighbors
      const neighbors = this.getNeighbors(current, graph);
      
      for (const neighbor of neighbors) {
        const edge = graph.edges[`${current}-${neighbor}`];
        if (!edge) continue;
        
        let newDistance = distances[current] + edge.travelTime;
        let newTransfers = transfers[current];
        
        // Check if this is a transfer
        if (routeAtNode[current] && routeAtNode[current] !== edge.routeId) {
          newTransfers++;
          if (optimizationStrategy === 'minTransfers') {
            newDistance += this.transferPenalty;
          }
        }
        
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          previous[neighbor] = current;
          routeAtNode[neighbor] = edge.routeId;
          transfers[neighbor] = newTransfers;
        }
      }
    }
    
    // Reconstruct path
    const path = [];
    let current = destinationId;
    
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
    
    if (path.length === 1 && path[0] !== sourceId) {
      return null; // No path found
    }
    
    // Build segments
    const segments = this.buildSegments(path, routeAtNode, graph);
    
    return {
      path,
      totalStops: path.length - 1,
      totalTravelTime: distances[destinationId],
      totalTransfers: transfers[destinationId],
      segments
    };
  }
  
  getNeighbors(nodeId, graph) {
    const neighbors = [];
    
    Object.keys(graph.edges).forEach(edgeKey => {
      const [from, to] = edgeKey.split('-');
      if (from === nodeId) {
        neighbors.push(to);
      }
    });
    
    return neighbors;
  }
  
  buildSegments(path, routeAtNode, graph) {
    const segments = [];
    let currentSegment = null;
    
    for (let i = 0; i < path.length - 1; i++) {
      const fromNode = path[i];
      const toNode = path[i + 1];
      const edge = graph.edges[`${fromNode}-${toNode}`];
      
      if (!currentSegment || currentSegment.routeId !== edge.routeId) {
        if (currentSegment) {
          segments.push(currentSegment);
        }
        
        currentSegment = {
          routeId: edge.routeId,
          routeName: edge.routeName,
          routeColor: edge.routeColor,
          fromStop: graph.nodes[fromNode].name,
          toStop: null,
          stops: [graph.nodes[fromNode].name]
        };
      }
      
      currentSegment.stops.push(graph.nodes[toNode].name);
      
      if (i === path.length - 2) {
        currentSegment.toStop = graph.nodes[toNode].name;
        segments.push(currentSegment);
      }
    }
    
    return segments;
  }
  
  setTransferPenalty(penalty) {
    this.transferPenalty = penalty;
  }
}

module.exports = new PathOptimizer();