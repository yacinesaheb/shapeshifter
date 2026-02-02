import { useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export default function DemoSection() {
  const controls = useAnimation();
  const [running, setRunning] = useState(false);
  const frameRef = useRef(null);

  const startAnimation = async () => {
    if (running) return;
    setRunning(true);

    const containerWidth = frameRef.current?.offsetWidth || 0;
    const virusWidth = 48; // w-12 = 48px
    const endX = containerWidth - virusWidth - 8; // margin

    // 🟢 Instantly reset to start before animation begins
    controls.set({ x: 0, opacity: 1 });

    // Small delay to visually reset cleanly
    await new Promise((r) => setTimeout(r, 100));

    // Move to the wall
    await controls.start({
      x: containerWidth / 2 - virusWidth / 2,
      transition: { duration: 1.2, ease: "easeInOut" },
    });

    // Impact pulse
    await controls.start({
      scale: [1, 1.3, 0.9, 1],
      backgroundColor: ["rgb(34,197,94)", "#ff0000", "rgb(34,197,94)"],
      transition: { duration: 0.6, ease: "easeInOut" },
    });

    // Continue fully to the end
    await controls.start({
      x: endX,
      transition: { duration: 1.4, ease: "easeOut" },
    });

    // Fade out
    await controls.start({ opacity: 0, transition: { duration: 0.5 } });

    setRunning(false);
  };

  return (
    <section className="py-24 px-6 text-center">
      <h2 className="text-3xl font-bold mb-12 text-green-400">Virus in Action</h2>

      <div
        ref={frameRef}
        className="relative w-full max-w-3xl h-48 mx-auto bg-gray-900 border-2 border-green-600 rounded-2xl overflow-hidden shadow-lg shadow-green-700/30"
      >
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-green-500/60"></div>

        <motion.div
          animate={controls}
          initial={{ x: 0, opacity: 1 }}
          className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)] flex items-center justify-center text-2xl"
        >
          
        </motion.div>
      </div>

      <button
        onClick={startAnimation}
        disabled={running}
        className="mt-8 px-8 py-3 bg-green-500 text-black text-xl  font-bold rounded-xl hover:bg-green-400 transition disabled:opacity-50"
      >
        {running ? "Running..." : "Start "}
      </button>
    </section>
  );
}
