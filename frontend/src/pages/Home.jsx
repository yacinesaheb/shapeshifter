import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Upload, ShieldCheck, Zap } from "lucide-react";
import Hero from "../components/Hero";
import DemoSection from "../components/DemoSection";

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target);
    if (start === end) return;
    const incrementTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function Home() {
  const { user, getStats } = useAuth();
  const [stats, setStats] = useState({ files: 0, users: 0, uptime: 99 });

  useEffect(() => {
    (async () => {
      try {
        const s = await getStats();
        setStats(s);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [getStats]);

  const filesCount = useCountUp(stats.files);
  const usersCount = useCountUp(stats.users);
  const uptimeCount = useCountUp(stats.uptime);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Hero />

      {/* Features Section */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-green-400">
          Why Choose Shapeshifter?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg shadow-green-700/20 text-center">
            <Upload className="mx-auto text-green-400 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Easy Uploads</h3>
            <p className="text-gray-400">
              Drag & drop or browse files effortlessly. Fast, simple, and reliable.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg shadow-green-700/20 text-center">
            <ShieldCheck className="mx-auto text-green-400 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-gray-400">
              Your files are encrypted and safe. Only you control who has access.
            </p>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg shadow-green-700/20 text-center">
            <Zap className="mx-auto text-green-400 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">
              Powered by modern tech to ensure high-speed uploads and instant transformations.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Our Impact (real + animated) */}
      <section className="py-20 px-6 bg-gray-900 text-green-400 text-center">
        <h2 className="text-3xl font-bold mb-12">Our Impact</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-4xl font-extrabold">
            {filesCount}+
            <p className="text-gray-400 text-lg mt-2">Files Processed</p>
          </div>
          <div className="text-4xl font-extrabold">
            {usersCount}+
            <p className="text-gray-400 text-lg mt-2">Active Users</p>
          </div>
          <div className="text-4xl font-extrabold">
            {uptimeCount}%
            <p className="text-gray-400 text-lg mt-2">Uptime</p>
          </div>
        </div>
      </section>

      <DemoSection />

      {/* CTA */}
      <section className="py-24 px-6 text-center bg-gradient-to-t from-gray-900/60 to-gray-950">
        <h2 className="text-4xl font-extrabold mb-6 text-green-400">
          Ready to Shape Your Files?
        </h2>
        <p className="text-gray-300 mb-8">
          Get started now and explore the power of Shapeshifter.
        </p>

        {user ? (
          <Link
            to="/dashboard"
            className="px-8 py-4 bg-green-500 text-black rounded-xl font-bold text-lg hover:bg-green-400 transition"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            to="/signup"
            className="px-8 py-4 bg-green-500 text-black rounded-xl font-bold text-lg hover:bg-green-400 transition"
          >
            Create Free Account
          </Link>
        )}
      </section>
    </div>
  );
}
