import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Upload as UploadIcon } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const { uploadFile } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!file) return setMessage("⚠️ Please select a file first.");

    try {
      await uploadFile(file);
      setMessage("✅ File uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br bg-gray-950 flex flex-col items-center justify-center text-white px-4">
      <div className="bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] border border-green-600/40 p-10 w-full max-w-md flex flex-col items-center gap-6 transition-transform hover:scale-[1.01] md:scale-130">

        <h1 className="text-3xl font-extrabold text-green-400 text-center">
          Upload Your File
        </h1>

        <p className="text-gray-400 text-sm text-center">
          Choose a file and upload it securely to your account.
        </p>

        <form onSubmit={handleUpload} className="w-full flex flex-col gap-5">
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-green-500/50 rounded-xl cursor-pointer hover:bg-green-500/10 transition"
          >
            <UploadIcon className="w-10 h-10 text-green-400 mb-2" />
            <span className="text-sm text-gray-300">
              {file ? file.name : "Click to select a file"}
            </span>
            <input
              id="file"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button
            type="submit"
            className="bg-green-500 text-black font-semibold py-3 rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-green-500/30"
          >
            Upload
          </button>
        </form>

        {message && (
          <div className="text-center text-sm font-medium mt-2">
            <p
              className={`${
                message.includes("✅")
                  ? "text-green-400"
                  : message.includes("⚠️")
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
