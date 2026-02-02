import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Upload, FileText, User, Trash2, Download, Shield, Activity, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { getProfile, getRecentUploads, uploadFile, mutatePayload } = useAuth();

  const [profile, setProfile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Mutation state
  const [mutating, setMutating] = useState(false);
  const [mutationResult, setMutationResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, u] = await Promise.all([getProfile(), getRecentUploads()]);
        setProfile(p);
        setUploads(u);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadFile(file);
      alert("✅ File uploaded successfully!");
      window.location.reload();
    } catch (err) {
      alert("❌ Upload failed");
    }
  };

  const handleMutation = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMutating(true);
    setMutationResult(null);

    try {
      const result = await mutatePayload(file);
      setMutationResult(result);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Unknown error";
      alert(`❌ Mutation failed: ${msg}`);
    } finally {
      setMutating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-950 text-green-400 text-2xl">
        Loading dashboard...
      </div>
    );
  }

  const filesToShow = showAll ? uploads : uploads.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-green-400">
          Welcome back, {profile?.username || "Guest"} 👋
        </h1>
        {profile?.is_admin && (
          <a href="/admin" className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition">
            <Shield size={20} /> Admin Panel
          </a>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">

        {/* 🛡️ Automated Evasion Engine */}
        <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border border-green-500/30 p-8 rounded-2xl shadow-lg shadow-green-500/20">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-green-400">
            <Shield size={32} /> Automated Evasion Engine
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Upload Zone */}
            <div>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed border-green-500/50 rounded-xl p-10 cursor-pointer hover:bg-green-900/10 transition group ${mutating ? 'opacity-50 pointer-events-none' : ''}`}>
                <input type="file" className="hidden" onChange={handleMutation} accept=".exe" />
                {mutating ? (
                  <RefreshCw size={48} className="text-green-400 animate-spin mb-4" />
                ) : (
                  <Activity size={48} className="text-green-400 mb-4 group-hover:scale-110 transition" />
                )}
                <p className="text-green-300 font-semibold text-lg">
                  {mutating ? "Processing Payload..." : "Drop Payload to Mutate"}
                </p>
                <p className="text-sm text-gray-400 mt-2">.exe files only</p>
              </label>
            </div>

            {/* Results Zone */}
            <div className="bg-gray-950/50 rounded-xl p-6 h-full min-h-[200px] flex flex-col justify-center">
              {mutationResult ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-xl">
                    <span>✅ Mutation Successful</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Original Hash:</span>
                      <span className="font-mono text-gray-500">{mutationResult.original_md5.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Variant Hash:</span>
                      <span className="font-mono text-green-400">{mutationResult.variant_md5.substring(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size Change:</span>
                      <span className="text-green-400">+{mutationResult.size_diff} bytes</span>
                    </div>
                  </div>

                  <a
                    href={`http://localhost:8000${mutationResult.variant_url}`}
                    className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-center transition flex justify-center items-center gap-2"
                    download
                  >
                    <Download size={20} /> Download Evaded Payload
                  </a>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Upload a file to see real-time mutation results.</p>
                  <p className="text-xs mt-2 opacity-50">Perturbation: section_append</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🧾 Recent Uploads */}
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-green-400" /> {showAll ? "All Files" : "Recent Uploads"}
          </h2>

          {uploads.length > 0 ? (
            <ul className="text-gray-300 space-y-2">
              {filesToShow.map((file, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg hover:bg-gray-800"
                >
                  <div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium hover:underline"
                    >
                      {file.name}
                    </a>
                    <p className="text-xs text-gray-500">{file.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      download
                      className="text-green-400 hover:text-green-300"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No uploads yet.</p>
          )}

          {uploads.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 text-green-400 text-sm cursor-pointer hover:underline"
            >
              {showAll ? "Show less ↑" : "View all uploads →"}
            </button>
          )}
        </div>

        {/* 👤 Profile Info */}
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <User className="text-green-400" /> Profile
          </h2>

          {profile ? (
            <div className="space-y-3">
              <p className="flex justify-between border-b border-gray-800 pb-2">
                <span className="font-semibold text-green-400">Username</span>
                <span>{profile.username}</span>
              </p>
              <p className="flex justify-between border-b border-gray-800 pb-2">
                <span className="font-semibold text-green-400">Email</span>
                <span>{profile.email}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-green-400">Role</span>
                <span className="bg-green-900/30 text-green-400 px-2 py-0.5 rounded text-sm">Subscriber</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Loading profile...</p>
          )}
        </div>
      </div>
    </div>
  );
}
