import React, { useEffect, useRef, useState } from 'react';
import './WaitingApproval.css';

function WaitingApproval() {
  const [score, setScore] = useState(0);
  const [catY, setCatY] = useState(200);
  const velocity = useRef(0);
  const gravity = 0.7;
  const jumpPower = -10;
  const interval = useRef(null);

  useEffect(() => {
    // Game loop
    interval.current = setInterval(() => {
      velocity.current += gravity;
      setCatY(prev => {
        const next = prev + velocity.current;
        return next > 300 ? 300 : next;
      });
    }, 30);

    return () => clearInterval(interval.current);
  }, []);

  const jump = () => {
    velocity.current = jumpPower;
    setScore(prev => prev + 1);
  };

  return (
    <div className="waiting-page">
      <h1 className="title">Waiting for Approval...</h1>
      <p className="subtitle">Hang tight! Meanwhile, try clicking the Box </p>

      <div className="game-area" onClick={jump}>
        <div className="cat" style={{ top: `${catY}px` }} />
      </div>

      <div className="score">
        Score: {score}
      </div>
    </div>
  );
}

export default WaitingApproval;
