import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:8000/api/users/login/", { username, password });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      // Throw a new error to be caught in Login.jsx
      throw new Error(err.response?.data?.non_field_errors?.[0] || "Login failed");
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post("http://localhost:8000/api/users/register/", { username, email, password });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      throw new Error(err.response?.data?.non_field_errors?.[0] || "Signup failed");
    }
  };




  const googleLogin = async (credential) => {
    try {
      const res = await axios.post("http://localhost:8000/api/users/google-login/", { token: credential });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      console.error("Frontend Google Login Error:", err);
      if (err.response) {
        console.error("Response Data:", err.response.data);
        console.error("Response Status:", err.response.status);
      }
      throw new Error(err.response?.data?.error || "Google Login failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };


  const uploadFile = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/users/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`, // note: use "Token" not "Bearer"
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      throw new Error("Upload failed.");
    }
  };

  // 🟢 Fetch user profile
  const getProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const res = await axios.get("http://localhost:8000/api/users/me/", {
      headers: { Authorization: `Token ${token}` },
    });
    return res.data;
  };

  // 🟢 Fetch recent uploads
  const getRecentUploads = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    const res = await axios.get("http://localhost:8000/api/users/upload/", {
      headers: { Authorization: `Token ${token}` },
    });
    // adapt file data to what dashboard expects
    return res.data.map(f => ({
      name: f.file.split("/").pop(),
      url: f.file,
      date: new Date(f.uploaded_at).toLocaleString(),
      size: 0, // optional — your backend doesn’t send file size
    }));
  };

  // 🟢 Fake storage usage (since backend doesn’t yet provide it)
  const getStorageUsage = async () => {
    const uploads = await getRecentUploads();
    const totalUsed = 5000000; // just mock data (5 MB total)
    const totalCapacity = 10 * 1024 * 1024 * 1024; // 10 GB
    return {
      used: totalUsed,
      total: totalCapacity,
      file_count: uploads.length,
      percentage: (totalUsed / totalCapacity) * 100,
    };
  };




  // Get dashboard stats (files count, users count, uptime)
  // Fetch global stats for home page counters
  const getStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not logged in");

    const res = await axios.get("http://localhost:8000/api/users/stats/", {
      headers: { Authorization: `Token ${token}` },
    });

    return res.data; // returns { users, files, uptime }
  };

  const mutatePayload = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/evasion/mutate/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Token ${token}`,
          },
        }
      );
      return res.data;
    } catch (err) {
      console.error("Mutation failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || err.message || "Mutation failed";
      throw new Error(errorMessage);
    }
  };

  const getAdminFiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not logged in");

    const res = await axios.get("http://localhost:8000/api/users/files/admin/", {
      headers: { Authorization: `Token ${token}` },
    });

    return res.data;
  };






  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        googleLogin,
        logout,
        uploadFile,
        getProfile,
        getRecentUploads,
        getStorageUsage,
        getStorageUsage,
        getStats,
        mutatePayload,
        getAdminFiles,
      }}


    >
      {children}
    </AuthContext.Provider>
  );
};
