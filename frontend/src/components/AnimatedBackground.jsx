// src/components/AnimatedBackground.jsx
import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let fontSizeBase = 16;

    const setup = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      // create columns based on font size
      fontSizeBase = 12 + Math.floor(Math.random() * 8); // vary base size slightly
      const columns = Math.floor(width / fontSizeBase);
      const drops = new Array(columns).fill(1);
      const speeds = Array.from({ length: columns }, () => 0.5 + Math.random() * 0.5);
      const sizes = Array.from({ length: columns }, () => fontSizeBase * (0.6 + Math.random() * 1.6));
      const opacities = Array.from({ length: columns }, () => 0.3 + Math.random() * 0.7);

      return { drops, speeds, sizes, opacities, columns };
    };

    let { drops, speeds, sizes, opacities, columns } = setup();

    const chars = "01";

    function draw() {
      // fade the canvas a little to create the trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < columns; i++) {
        const x = i * fontSizeBase;
        const y = drops[i] * sizes[i];

        ctx.fillStyle = `rgba(0,255,136,${opacities[i]})`; // neon green with column opacity
        ctx.font = `${sizes[i]}px monospace`;

        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, x, y);

        // move drop by its speed
        drops[i] += speeds[i];

        // reset randomly
        if (drops[i] * sizes[i] > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      cancelAnimationFrame(rafRef.current);
      const newSetup = setup();
      drops = newSetup.drops;
      speeds = newSetup.speeds;
      sizes = newSetup.sizes;
      opacities = newSetup.opacities;
      columns = newSetup.columns;
      draw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // canvas is z-0, page content should use higher z-index (z-10+)
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
