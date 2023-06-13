import { dijkstra, Node,getNodesInShortestPathOrder} from '../src/algorithms/Dijkstra';

describe('Dijkstra Algorithm', () => {
  const createNode = (x: number, y: number, walkable = true, type: 'normal' | 'start' | 'end' = 'normal') => ({
    x,
    y,
    walkable,
    type,
    distance: Infinity,
    previousNode: undefined  ,
  });

  const createGrid = (width: number, height: number) => {
    const grid: Node[][] = [];
    for (let x = 0; x < width; x++) {
      grid[x] = [];
      for (let y = 0; y < height; y++) {
        grid[x][y] = createNode(x, y);
      }
    }
    return grid;
  };

  it('should find the shortest path from start to end', () => {
    const grid = createGrid(3, 3);
    const startNode = grid[0][0];
    const endNode = grid[2][2];
    const { nodesToAnimate, path } = dijkstra(grid, startNode, endNode);
    expect(nodesToAnimate.length).toBeGreaterThan(0);
    expect(path.length).toBeGreaterThan(0);
    expect(path[0]).toBe(startNode);
    expect(path[path.length - 1]).toBe(endNode);
  });

  it('should return empty path if no valid path exists', () => {
    const grid = createGrid(3, 3);
    const startNode = grid[0][0];
    const endNode = grid[1][1];
    const { nodesToAnimate, path } = dijkstra(grid, startNode, endNode);
    expect(nodesToAnimate.length).toBeGreaterThan(0);
    expect(path.length).toBe(0);
  });

  it('should correctly determine the nodes in the shortest path order', () => {
    const grid = createGrid(3, 3);
    const startNode = grid[0][0];
    const endNode = grid[2][2];
    dijkstra(grid, startNode, endNode);
    const shortestPathOrder = getNodesInShortestPathOrder(endNode);
    expect(shortestPathOrder.length).toBeGreaterThan(0);
    expect(shortestPathOrder[0]).toBe(startNode);
    expect(shortestPathOrder[shortestPathOrder.length - 1]).toBe(endNode);
  });
});

