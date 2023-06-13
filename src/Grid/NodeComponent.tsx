import React from 'react';

interface NodeComponentProps {
  x: number;
  y: number;
  size: number;
  gap: number;
  walkable: boolean;
  type: 'start' | 'end' | 'normal' | 'visited' | 'visited2' | 'path' | 'wall' | 'bomb';
  onMouseEnter: ((x: number, y: number) => void) | null;
  onMouseDown: ((x: number, y: number) => void) | null;
  onMouseUp: ((x: number, y: number) => void) | null;
}

const NodeComponent: React.FC<NodeComponentProps> = React.memo(({ 
  x, y, size, gap, walkable, type, onMouseEnter, onMouseDown, onMouseUp
}) => {
  const handleMouseEnter = () => {
    if (onMouseEnter) {
      onMouseEnter(x, y);
    }
  };

  const handleMouseDown = () => {
    if (onMouseDown) {
      onMouseDown(x, y);
    }
  };

  const handleMouseUp = () => {
    if (onMouseUp) {
      onMouseUp(x, y);
    }
  };

  const nodeType = walkable ? type : 'wall';

  return (
    <div
      className={`node ${nodeType}`}
      style={{
        left: `${x * (size + gap)}px`,
        top: `${y * (size + gap)}px`,
        width: `${size}px`,
        height: `${size}px`,
        position: 'absolute'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
});

export default NodeComponent;
