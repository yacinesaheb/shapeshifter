import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google"; // Changed from GoogleLogin to useGoogleLogin
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AnimatedBackground from "../components/AnimatedBackground";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Use the hook for custom button
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Updated: pass access_token
        await googleLogin(tokenResponse.access_token);
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        setError(err.message || "Google Login failed");
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    }
  };


  return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <AnimatedBackground />

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl shadow-lg shadow-green-700/40 w-96 md:scale-[1.5]"
      >
        <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Login
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-3 text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded-lg bg-gray-800 text-white mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg bg-gray-800 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-black font-semibold py-3 rounded-lg hover:bg-green-400 transition"
        >
          Login
        </button>

        <div className="mt-4 flex flex-col items-center w-full">
          <div className="text-gray-400 text-sm mb-3">Or continue with</div>
          <button
            type="button"
            onClick={() => googleLoginHandler()}
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-3"
          >
            {/* Simple Google "G" Icon SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </form>
    </div>
  );
}
