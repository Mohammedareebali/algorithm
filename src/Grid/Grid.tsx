// components/Grid.tsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  x: number;
  y: number;
  walkable: boolean;
}

const createGridData = (nodeCount: number): Node[][] => {
  const data: Node[][] = [];
  for (let x = 0; x < nodeCount; x++) {
    data[x] = [];
    for (let y = 0; y < nodeCount; y++) {
      data[x][y] = { x, y, walkable: true };  // All nodes are walkable initially.
    }
  }
  return data;
};

export const Grid: React.FC = () => {
  const ref = useRef(null);
  const nodeCount = 20;  // Change this to adjust the size of the grid.
  const nodeSize = 25;  // The size of each node, in pixels.
  const nodeGap = 5;  // The gap between nodes, in pixels.

  const gridData = createGridData(nodeCount);

  useEffect(() => {
    const svg = d3.select(ref.current)
      .append('svg')
      .attr('width', nodeCount * (nodeSize + nodeGap))
      .attr('height', nodeCount * (nodeSize + nodeGap));

    const row = svg.selectAll('.row')
      .data(gridData)
      .enter().append('g')
      .attr('class', 'row');

    const column = row.selectAll('.square')
      .data(d => d)
      .enter().append('rect')
      .attr('class','square')
      .attr('x', d => d.x * (nodeSize + nodeGap) + nodeGap / 2)
      .attr('y', d => d.y * (nodeSize + nodeGap) + nodeGap / 2)
      .attr('width', nodeSize - nodeGap)
      .attr('height', nodeSize - nodeGap)
      .style('fill', '#ddd')  // Initial color of nodes.
      .style('stroke', '#222');  // Border color of nodes.
  }, [gridData, nodeCount, nodeSize, nodeGap]);

  return <div ref={ref}></div>
};
