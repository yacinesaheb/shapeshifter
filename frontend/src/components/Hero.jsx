import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Hero() {
  const { user } = useAuth();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const letters = "01"; // Hacker-style characters
    const fontSize = 20;
    const columns = Math.floor(w / fontSize);
    const drops = Array(columns).fill(0);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // trailing effect
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#0f0";
      ctx.font = `${fontSize}px monospace`;
      ctx.shadowColor = "lime";
      ctx.shadowBlur = 10;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly to make it smooth and dynamic
        if (drops[i] * fontSize > h && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center text-center py-24 px-6 bg-gradient-to-b from-gray-900/70 to-gray-950 overflow-hidden">
      {/* Animated Background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Hero Content */}
      <div className="relative z-10  bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl shadow-lg shadow-green-700/40 w-fill">
        <h1 className="text-5xl font-extrabold text-green-400 mb-6 drop-shadow-lg ">
          Welcome to Shapeshifter
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mb-8">
          A platform to upload, transform, and manage your files securely with
          speed and style.
        </p>

        {user ? (
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-green-500 text-black rounded-xl font-bold text-lg hover:bg-green-400 transition"
          >
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-green-500 text-black rounded-xl font-bold text-lg hover:bg-green-400 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 border-2 border-green-500 text-green-400 rounded-xl font-bold text-lg hover:bg-green-500 hover:text-black transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
