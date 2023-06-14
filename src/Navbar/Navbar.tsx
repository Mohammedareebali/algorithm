import React from 'react';
import { Navbar, NavDropdown, Nav, Button } from 'react-bootstrap';

export const NavbarComponent: React.FC<{visualize: (algorithm: string) => void, clearBoard: () => void, addBomb: any,createMazePattern1:any}> = ({visualize, clearBoard, addBomb,createMazePattern1}) => {
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('dijkstra');
   console.log(selectedAlgorithm)
    return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#">Pathfinder Visualizer</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="Algorithms" id="basic-nav-dropdown">
          <NavDropdown.Item onClick={() => setSelectedAlgorithm('algorithm1')}>Algorithm 1</NavDropdown.Item>
        <NavDropdown.Item onClick={() => setSelectedAlgorithm('algorithm2')}>Algorithm 2</NavDropdown.Item>
        <NavDropdown.Item onClick={() => setSelectedAlgorithm('algorithm3')}>Algorithm 3</NavDropdown.Item>
      </NavDropdown>
          <NavDropdown title="Mazes and Patterns" id="basic-nav-dropdown">
          <NavDropdown.Item onClick={createMazePattern1}>Maze Pattern 1</NavDropdown.Item>
  <NavDropdown.Item href="#action/3.2">Maze 2</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Maze 3</NavDropdown.Item>
          </NavDropdown>
        </Nav>
       {addBomb}
       <Button variant="outline-primary" onClick={() => visualize(selectedAlgorithm)}>Visualize</Button>
      <Button variant="outline-danger" onClick={clearBoard}>Clear Board</Button>
      </Navbar.Collapse>
    </Navbar>
  );
};
