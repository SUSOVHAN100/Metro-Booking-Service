const Stop = require('../models/Stop');
const Route = require('../models/Route');

class GraphService {
  constructor() {
    this.graph = null;
    this.lastUpdated = null;
  }

  async buildGraph() {
    const stops = await Stop.find();
    const routes = await Route.find();
    
    const graph = {
      nodes: {},
      edges: {},
      interchanges: {}
    };

    // Add nodes (stops)
    stops.forEach(stop => {
      graph.nodes[stop.stopId] = {
        id: stop.stopId,
        name: stop.name,
        routes: stop.routes,
        isInterchange: stop.isInterchange
      };
      
      if (stop.isInterchange) {
        graph.interchanges[stop.stopId] = stop.routes;
      }
    });

    // Add edges (connections between consecutive stops)
    routes.forEach(route => {
      const stopsList = route.stops;
      
      for (let i = 0; i < stopsList.length - 1; i++) {
        const currentStop = stopsList[i];
        const nextStop = stopsList[i + 1];
        
        const edgeKey = `${currentStop.stopId}-${nextStop.stopId}`;
        const reverseEdgeKey = `${nextStop.stopId}-${currentStop.stopId}`;
        
        const travelTime = currentStop.travelTimeToNext || 2; // Default 2 minutes
        
        graph.edges[edgeKey] = {
          from: currentStop.stopId,
          to: nextStop.stopId,
          routeId: route.routeId,
          routeName: route.name,
          routeColor: route.color,
          travelTime: travelTime
        };
        
        graph.edges[reverseEdgeKey] = {
          from: nextStop.stopId,
          to: currentStop.stopId,
          routeId: route.routeId,
          routeName: route.name,
          routeColor: route.color,
          travelTime: travelTime
        };
      }
    });

    this.graph = graph;
    this.lastUpdated = new Date();
    
    return graph;
  }

  getGraph() {
    return this.graph;
  }

  async refreshGraph() {
    return await this.buildGraph();
  }
}

module.exports = new GraphService();
