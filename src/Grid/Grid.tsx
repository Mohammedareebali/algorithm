import React, { useEffect, useState, useCallback, useRef } from "react";
import NodeComponent from './NodeComponent';
import {  Button } from 'react-bootstrap';

import { NavbarComponent } from "../Navbar/Navbar";
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
      const node: Node = {
        id: `${x}-${y}`,
        x,
        y,
        walkable: true,
        type: 'normal',
        neighbors: [],
      };
if(x === 10 && y === 10){
    node.type = 'start';
}
      if (x === 35 && y === 15){
node.type = 'end'
      }

      data[x][y] = node;
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
  const [startNode, setStartNode] = useState<Node | null>(gridData[10][10]);
  const [endNode, setEndNode] = useState<Node | null>(gridData[35][15]);
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

 
  const handleToggleWallNode = (x: number, y: number) => {
    const newData = [...gridData];
    if (newData[x][y].type === 'start' || newData[x][y].type === 'end' || newData[x][y].type === 'bomb') {
        return;
      }
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
  const clearGrid = () => {
    setGridData(createGridData(nodeCountX, nodeCountY));
    
    setBombNode(null);
    setIsRunning(false);
};
const button  = <Button variant="outline-success" disabled={isRunning} onClick={() => handleSetBombNode(30, 19)}>
Bomb
</Button> ;
const recursiveDivision = (
    grid: Node[][], 
    minRow: number, 
    maxRow: number, 
    minCol: number, 
    maxCol: number,
  ) => {
    if (maxRow < minRow || maxCol < minCol) {
      return;
    }
  
    // Choose a random row and column
    const randomRow = Math.floor(Math.random() * (maxRow - minRow + 1) + minRow);
    const randomCol = Math.floor(Math.random() * (maxCol - minCol + 1) + minCol);
  
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        // Make a wall at the random row and column, but leave a gap
        if ((i === randomRow || j === randomCol) && !(i === minRow && j === randomCol) && !(i === maxRow && j === randomCol) && !(i === randomRow && j === minCol) && !(i === randomRow && j === maxCol)) {
          grid[i][j].type = 'wall';
          grid[i][j].walkable = false;
        }
      }
    }
  
    // Recursively divide the grid into quadrants
    recursiveDivision(grid, minRow, randomRow - 1, minCol, randomCol - 1); // Top left
    recursiveDivision(grid, minRow, randomRow - 1, randomCol + 1, maxCol); // Top right
    recursiveDivision(grid, randomRow + 1, maxRow, minCol, randomCol - 1); // Bottom left
    recursiveDivision(grid, randomRow + 1, maxRow, randomCol + 1, maxCol); // Bottom right
  };
  
  const createMazePattern1 = () => {
    const newData = [...gridData];
    recursiveDivision(newData, 1, nodeCountX - 2, 1, nodeCountY - 2);
    setGridData(newData);
  };
  //chose algorithm 
  const runAlgorithm = useCallback((algorithm:any) => {
    switch(algorithm) {
      case 'algorithm1':
        // Run Dijkstra
        console.log('it ran')
        console.log(startNode,endNode)
        runDijkstra();
        break;
      case 'algorithm2':
        // Run Algorithm 2
        break;
      case 'algorithm3':
        // Run Algorithm 3
        break;
      default:
        // Run Dijkstra as default
        runDijkstra();
        console.log('it didnt ran')
    }
  }, [runDijkstra]);
  return (
    <>
    
    <NavbarComponent
     visualize={runAlgorithm}
     clearBoard={clearGrid} 
     addBomb= {button} 
     createMazePattern1={createMazePattern1}/>

    <div className="home">
     
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
    </>
  );
};
