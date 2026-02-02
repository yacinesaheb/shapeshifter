import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Shield, FileText, User, Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const { getProfile, getAdminFiles } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const profile = await getProfile();
                if (!profile.is_admin) {
                    alert("Access Denied: Admins only.");
                    navigate("/dashboard");
                    return;
                }

                const adminFiles = await getAdminFiles();
                setFiles(adminFiles);
            } catch (err) {
                console.error("Admin fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [navigate, getProfile, getAdminFiles]);

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center bg-gray-950 text-green-400">Loading Admin Panel...</div>;
    }

    const filteredFiles = files.filter(f =>
        f.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.owner_username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-red-500 mb-2 flex items-center gap-3">
                    <Shield size={40} /> Admin Dashboard
                </h1>
                <p className="text-gray-400 mb-8">Global File Management System</p>

                <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-red-500/20 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="text-red-400" /> All User Files ({filteredFiles.length})
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search user or file..."
                                className="bg-gray-800 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-500 transition w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800">
                                    <th className="p-4 font-medium">Filename</th>
                                    <th className="p-4 font-medium">Uploaded By</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredFiles.map((file) => (
                                    <tr key={file.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                                        <td className="p-4 flex items-center gap-2">
                                            <FileText size={16} className="text-gray-500" />
                                            <span className="font-mono text-gray-300">{file.filename}</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-500" />
                                                <span className="text-green-400">{file.owner_username}</span>
                                                <span className="text-xs text-gray-600">({file.owner_email})</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500">{file.uploaded_at}</td>
                                        <td className="p-4">
                                            <a
                                                href={`http://localhost:8000${file.url}`}
                                                download
                                                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Download size={14} /> Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredFiles.length === 0 && (
                            <div className="text-center py-10 text-gray-500">No files found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
