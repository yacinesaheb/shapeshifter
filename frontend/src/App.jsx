// src/App.jsx
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import AdminDashboard from "./pages/AdminDashboard";


export default function App() {
  return (
    <GoogleOAuthProvider clientId="586301175086-cc2094vskj5n73m8j99epckqc0lne2u2.apps.googleusercontent.com">
      <AuthProvider>
        <Router>
          <Navbar />
          {/* give space for fixed navbar */}
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
