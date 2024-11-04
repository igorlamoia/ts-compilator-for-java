import React, { useEffect, useRef } from "react";

export const NightSky = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Function to resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Redraw background color
      ctx.fillStyle = "#112";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Initial setup
    resizeCanvas();

    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";

    // Function to animate stars
    const animate = () => {
      const x = canvas.width * Math.random();
      const y = canvas.height * Math.random();
      const r = 2.5 * Math.random();

      // Draw the stars
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Slow down animation speed
      setTimeout(animate, 100);
    };

    // Start animation
    animate();

    // Resize listener
    window.addEventListener("resize", resizeCanvas);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0" />;
};
