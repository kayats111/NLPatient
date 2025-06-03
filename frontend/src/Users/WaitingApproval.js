import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WaitingApproval.css';

const GRID_SIZE = 20;           // 20×20 grid
const INITIAL_SNAKE = [{ x: 9, y: 9 }]; // start in center
const INITIAL_DIRECTION = { x: 1, y: 0 }; // moving right initially
const TICK_INTERVAL = 200;      // milliseconds between “ticks” (game speed)

function getRandomFood(snake) {
  let cell;
  do {
    cell = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === cell.x && segment.y === cell.y));
  return cell;
}

function WaitingApproval() {
  const navigate = useNavigate();

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const intervalRef = useRef(null);

  // Handle arrow keys (or WASD) to change direction
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameOver]);

  // Main game loop: move snake on every tick
  useEffect(() => {
    if (gameOver) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Check collision with walls
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check collision with itself
        if (prevSnake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        let newSnake;
        // If eating food, grow
        if (newHead.x === food.x && newHead.y === food.y) {
          newSnake = [newHead, ...prevSnake];
          setScore((s) => s + 1);
          setFood(getRandomFood(newSnake));
        } else {
          // Regular move: add new head, drop last tail segment
          newSnake = [newHead, ...prevSnake.slice(0, prevSnake.length - 1)];
        }
        return newSnake;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [direction, food, gameOver]);

  const handleExit = () => {
    navigate("/");
  };

  const handleRestart = () => {
    clearInterval(intervalRef.current);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(getRandomFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="snake-overlay">
      <div className="snake-container">
        <h2 className="waiting-title">Your Account is Awaiting Approval...</h2>
        <h2 className="waiting-title">Please Have An Apple In The Meantime</h2>
        <div className="snake-header">
          <h2>Snake (Score: {score})</h2>
          <div>
            <button onClick={handleRestart}>Restart</button>
            <button onClick={handleExit}>Exit</button>
          </div>
        </div>
        <div className="snake-grid">
          {Array.from({ length: GRID_SIZE }).map((_, rowIdx) => (
            <div key={rowIdx} className="snake-row">
              {Array.from({ length: GRID_SIZE }).map((_, colIdx) => {
                const isHead =
                  snake.length > 0 &&
                  snake[0].x === colIdx &&
                  snake[0].y === rowIdx;
                const isBody = snake.some(
                  (seg, idx) =>
                    idx > 0 && seg.x === colIdx && seg.y === rowIdx
                );
                const isFood = food.x === colIdx && food.y === rowIdx;
                return (
                  <div
                    key={colIdx}
                    className={`snake-cell ${
                      isHead
                        ? "snake-head"
                        : isBody
                        ? "snake-body"
                        : isFood
                        ? "snake-food"
                        : ""
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {gameOver && <div className="game-over">Game Over!</div>}
      </div>
    </div>
  );
}

export default WaitingApproval;
