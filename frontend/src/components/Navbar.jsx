import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react"; // Hamburger & Close icons

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 h-16 bg-gray-900/40 backdrop-blur-md shadow-md shadow-green-700/30 text-green-400">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4">
        {/* Logo */}
        <Link to="/" className="hover:text-green-300 transition">
          <h1 className="text-2xl font-bold tracking-widest">Shapeshifter</h1>
        </Link>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link to="/" className="hover:text-green-300 transition">
            Home
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-green-300 transition">
                Dashboard
              </Link>
              <Link to="/advanced" className="hover:text-green-300 transition">
                Advanced
              </Link>
              <Link to="/upload" className="hover:text-green-300 transition">
                Upload
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900/90 backdrop-blur-md transition-all duration-300 overflow-hidden ${isOpen ? "max-h-96 py-4" : "max-h-0"
          }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="hover:text-green-300 transition"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="hover:text-green-300 transition"
              >
                Dashboard
              </Link>
              <Link
                to="/advanced"
                onClick={() => setIsOpen(false)}
                className="hover:text-green-300 transition"
              >
                Advanced
              </Link>
              <Link
                to="/upload"
                onClick={() => setIsOpen(false)}
                className="hover:text-green-300 transition"
              >
                Upload
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="px-4 py-2 rounded-lg border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
