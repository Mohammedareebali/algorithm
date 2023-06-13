import React, { useEffect, useState, useCallback, useRef } from "react";
import NodeComponent from './NodeComponent';
import './css/grid.css'
import dijkstra from '../algorithms/Dijkstra'; 

export interface Node {
  id: string;
  x: number;
  y: number;
  walkable: boolean;
  type: 'start' | 'end' | 'normal' | 'visited' | 'visited2' | 'path' | 'wall' | 'bomb';
  neighbors: string[];
}

const createGridData = (nodeCountX: number, nodeCountY: number): Node[][] => {
  const data: Node[][] = [];
  for (let x = 0; x < nodeCountX; x++) {
    data[x] = [];
    for (let y = 0; y < nodeCountY; y++) {
      data[x][y] = {
        id: `${x}-${y}`,
        x,
        y,
        walkable: true,
        type: 'normal',
        neighbors: [],
      };
    }
  }

  // add neighbors for each node
  for (let x = 0; x < nodeCountX; x++) {
    for (let y = 0; y < nodeCountY; y++) {
      if (x > 0) data[x][y].neighbors.push(data[x - 1][y].id);
      if (y > 0) data[x][y].neighbors.push(data[x][y - 1].id);
      if (x < nodeCountX - 1) data[x][y].neighbors.push(data[x + 1][y].id);
      if (y < nodeCountY - 1) data[x][y].neighbors.push(data[x][y + 1].id);
    }
  }
  return data;
};

export const Grid: React.FC = () => {
  const nodeCountX = 45;
  const nodeCountY = 20;
  const nodeSize = 25;
  const nodeGap = 0;

  const [gridData, setGridData] = useState(createGridData(nodeCountX, nodeCountY));
  const [startNode, setStartNode] = useState<Node | null>(null);
  const [endNode, setEndNode] = useState<Node | null>(null);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [bombNode, setBombNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  

  const draggedNodeRef = useRef<Node | null>(null);
  const draggedNodeTypeRef = useRef<null | 'start' | 'end' | 'normal' | 'visited' | 'visited2' | 'path' | 'wall' | 'bomb'>(
    null
  );

  useEffect(() => {
    const handleMouseUp = () => setMouseIsPressed(false);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSetStartNode = (x: number, y: number) => {
    
    handleNodeInteraction(x, y, 'start');
  };

  const handleSetEndNode = (x: number, y: number) => {
    
    handleNodeInteraction(x, y, 'end');
  };

  const handleSetBombNode = (x: number, y: number) => {
    if (isRunning) return;

    handleNodeInteraction(x, y, 'bomb');
  };

  let delay = 0;
  const runDijkstra = useCallback(() => {
    if (!startNode || !endNode) return;
    setIsRunning(true);
    delay = 0;

    const flatNodes = gridData.flat();
    const nodesMap = flatNodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {} as { [id: string]: Node });

    const onVisit1 = (nodeId: string) => {
      const [x, y] = nodeId.split('-').map(Number);
      delay += 10;
      setTimeout(() => {
        const newData = [...gridData];
        newData[x][y].type = 'visited';
        setGridData(newData);
      }, delay);
    };

    let result1 = dijkstra(nodesMap, startNode.id, bombNode ? bombNode.id : endNode.id, onVisit1);

    // Delay before starting second search animation
    let delay2 = 10 * result1.visitOrder.length + 100; // Add extra delay between the two animations

    let result2: any;

    if (bombNode) {
      const onVisit2 = (nodeId: string) => {
        const [x, y] = nodeId.split('-').map(Number);
        delay2 += 10;
        setTimeout(() => {
          const newData = [...gridData];
          newData[x][y].type = 'visited2';
          setGridData(newData);
        }, delay2);
      };

      result2 = dijkstra(nodesMap, bombNode.id, endNode.id, onVisit2);
    }

    const delay3 = delay2 + 10 * (result2 ? result2.visitOrder.length : 0) + 100; // Delay before starting shortest path animation

    // Set up the animation for the shortest path
    setTimeout(() => {
      result1.path.forEach((node: { x: number; y: number }, index: number) => {
        setTimeout(() => {
          const newData = [...gridData];
          newData[node.x][node.y].type = 'path';
          setGridData(newData);
        }, index * 50);
      });

      if (result2) {
        result2.path.forEach((node: { x: number; y: number }, index: number) => {
          setTimeout(() => {
            const newData = [...gridData];
            newData[node.x][node.y].type = 'path';
            setGridData(newData);
          }, index * 50 + result1.path.length * 50);
        });
      }

      setIsRunning(false);
    }, delay3);
  }, [gridData, startNode, endNode, bombNode]);

  useEffect(() => {
    // re-run Dijkstra's algorithm when start or end node changes
    if (startNode && endNode) {
      runDijkstra();
    }
  }, [startNode, endNode]);

  const handleToggleWallNode = (x: number, y: number) => {
    const newData = [...gridData];
    // Check if the current node type is 'wall'
    // If it is, change it to 'normal'. If it's not, change it to 'wall'.
    newData[x][y].type = newData[x][y].type === 'wall' ? 'normal' : 'wall';
    if (newData[x][y].type === 'wall'){
        newData[x][y].walkable = false;
    }
    else{
        newData[x][y].walkable = true
    }
    setGridData(newData);
  };

  const handleNodeInteraction = (
    x: number,
    y: number,
    type: 'start' | 'end' | 'normal' | 'visited' | 'visited2' | 'path' | 'wall' | 'bomb' | null
  ) => {
    if (!['start', 'end', 'bomb', null].includes(type)) return;

    if (draggedNodeRef.current) {
      const oldNode = draggedNodeRef.current;
      const newData = [...gridData];
      newData[oldNode.x][oldNode.y].type = 'normal';
      setGridData(newData);
    }

    if (type) {
      const newData = [...gridData];
      const newNode = newData[x][y];

      if (newNode.type !== 'wall') {
        if (type === 'start') setStartNode(newNode);
        if (type === 'end') setEndNode(newNode);
        if (type === 'bomb') setBombNode(newNode);

        newNode.type = type;
        setGridData(newData);
      }
    } else {
      handleToggleWallNode(x, y);
    }

    draggedNodeRef.current = gridData[x][y];
    draggedNodeTypeRef.current = type;
  };

  return (
    <div className="home">
      <button onClick={() => handleSetStartNode(5, 5)}>Set Start Node</button>
      <button onClick={() => handleSetEndNode(nodeCountX - 5, nodeCountY - 5)}>Set End Node</button>
      <button onClick={runDijkstra}>Run Dijkstra</button>
      <button disabled={isRunning} onClick={() => handleSetBombNode(30, 19)}>
        Bomb
      </button>
      <div className="mega-container">
        <div
          className="grid-container"
          onMouseDown={() => setMouseIsPressed(true)}
          onMouseUp={() => setMouseIsPressed(false)}
        >
          {gridData.map((row) =>
            row.map((node) => (
              <NodeComponent
                key={node.id}
                x={node.x}
                y={node.y}
                size={nodeSize}
                gap={nodeGap}
                walkable={node.walkable}
                type={node.type}
                onMouseDown={(x: number, y: number) => {
                  if (!isRunning) {
                    if (['start', 'end', 'bomb'].includes(gridData[x][y].type)) {
                      draggedNodeRef.current = gridData[x][y];
                      draggedNodeTypeRef.current = gridData[x][y].type;
                    } else {
                      handleToggleWallNode(x, y);
                    }
                    setMouseIsPressed(true);
                  }
                }}
                onMouseEnter={(x: number, y: number) => {
                  if (!isRunning && mouseIsPressed && draggedNodeRef.current) {
                    handleNodeInteraction(x, y, draggedNodeTypeRef.current);
                  }
                  else if(mouseIsPressed){
                    handleToggleWallNode(x, y);
                  }
                }}
                onMouseUp={() => {
                  setMouseIsPressed(false);
                  draggedNodeRef.current = null;
                  draggedNodeTypeRef.current = null;
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
