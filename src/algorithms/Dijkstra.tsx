// components/dijkstra.ts
import { Node } from '../Grid/Grid';

interface NodeMap {
  [id: string]: Node;
}

function dijkstra(nodes: NodeMap, startNode: string, endNode: string, onVisit?: (nodeId: string) => void): { path: Node[], visitOrder: string[] } {
  const shortestDistances: { [nodeId: string]: number } = {};
  const previousNodes: { [nodeId: string]: Node | null } = {};
  const unvisitedNodes = new Set(Object.keys(nodes));
  const visitOrder: string[] = [];

  // Initialize all distances to infinity and all previous nodes to null.
  for (const nodeId in nodes) {
    shortestDistances[nodeId] = Infinity;
    previousNodes[nodeId] = null;
  }

  // The distance from the start node to itself is always 0.
  shortestDistances[startNode] = 0;

  while (unvisitedNodes.size > 0) {
    // Sort unvisited nodes by current known shortest distance from start node.
    const currentNodeId = Array.from(unvisitedNodes).sort((nodeIdA, nodeIdB) => {
      return shortestDistances[nodeIdA] - shortestDistances[nodeIdB];
    })[0];

    // Break loop if current node is the end node
    if (currentNodeId === endNode) {
      break;
    }

    unvisitedNodes.delete(currentNodeId);
    if (onVisit) {
      onVisit(currentNodeId);
      visitOrder.push(currentNodeId);
    }

    // If the shortest distance to the current node is infinity, we're done.
    if (shortestDistances[currentNodeId] === Infinity) {
      break;
    }

    for (const neighborId of nodes[currentNodeId].neighbors) {
      // Ignore non-walkable nodes
      if (!nodes[neighborId].walkable) continue;
      
      const tentativeDistance = shortestDistances[currentNodeId] + 1;  // All edges have equal weight.

      // If we've found a shorter path to this neighbor node, update the shortest distance and the previous node.
      if (tentativeDistance < shortestDistances[neighborId]) {
        shortestDistances[neighborId] = tentativeDistance;
        previousNodes[neighborId] = nodes[currentNodeId];
      }
    }
  }

  // Build the shortest path from start node to end node by traversing previous nodes from end to start.
  let path: Node[] = [];
  let currentNode: Node | null = nodes[endNode];

  while (currentNode) {
    path.unshift(currentNode);
    currentNode = previousNodes[currentNode.id];
  }

  // Return both shortest path and visit order
  return { path, visitOrder };
};



export default dijkstra;
