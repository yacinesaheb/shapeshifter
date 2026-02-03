
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Upload, FileText, CheckCircle, ArrowRight, Download, Activity, Play, AlertTriangle } from "lucide-react";

export default function AdvancedMode() {
    const { startExperiment, mutateExperiment, analyzeExperiment } = useAuth();

    // Steps: 1=Upload, 2=Choose Perturbation, 3=Download & Test, 4=Analyze
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Data State
    const [originalFile, setOriginalFile] = useState(null);
    const [originalPath, setOriginalPath] = useState("");
    const [perturbation, setPerturbation] = useState("");
    const [availablePerturbations, setAvailablePerturbations] = useState([]);
    const [recommendation, setRecommendation] = useState("");

    const [variantUrl, setVariantUrl] = useState("");
    const [variantPath, setVariantPath] = useState("");

    // Analysis State
    const [excelOriginal, setExcelOriginal] = useState(null);
    const [excelVariant, setExcelVariant] = useState(null);
    const [rateOriginal, setRateOriginal] = useState(0);
    const [rateVariant, setRateVariant] = useState(0);
    const [finalReport, setFinalReport] = useState(null);

    // STEP 1: Upload Original
    const handleUploadOriginal = async () => {
        if (!originalFile) return setError("Please select a file.");
        setLoading(true); setError("");
        try {
            const res = await startExperiment(originalFile);
            setOriginalPath(res.original_file_path);
            setAvailablePerturbations(res.available_perturbations);
            setRecommendation(res.recommendation);
            setPerturbation(res.recommendation); // Default selection
            setStep(2);
        } catch (err) {
            setError("Upload failed: " + err.message);
        }
        setLoading(false);
    };

    // STEP 2: Apply Perturbation
    const handleMutate = async () => {
        if (!perturbation) return setError("Please choose a perturbation.");
        setLoading(true); setError("");
        try {
            const res = await mutateExperiment(originalPath, perturbation);
            setVariantUrl(res.variant_url);
            setVariantPath(res.variant_path); // Need this for SSDeep analysis later
            setStep(3);
        } catch (err) {
            setError("Mutation failed: " + err.message);
        }
        setLoading(false);
    };

    // STEP 4: Analyze Reports
    const handleAnalyze = async () => {
        if (!excelOriginal || !excelVariant) return setError("Please upload both Excel reports.");
        setLoading(true); setError("");
        try {
            const res = await analyzeExperiment(
                excelOriginal,
                excelVariant,
                rateOriginal,
                rateVariant,
                originalPath,
                variantPath
            );
            setFinalReport(res);
            setStep(5);
        } catch (err) {
            setError("Analysis failed: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8 pt-20 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <h1 className="text-4xl font-bold text-green-400 mb-2 flex items-center gap-3">
                    <Activity className="animate-pulse" /> Advanced Manual Pipeline
                </h1>
                <p className="text-gray-400 mb-8">
                    Manually control the evasion process, test in your sandbox, and verify results.
                </p>

                {/* Progress Bar */}
                <div className="flex justify-between items-center mb-10 w-full px-10">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className={`flex items-center justify-center w-10 h-10 rounded-full font-bold border-2 transition-all ${step >= s ? "bg-green-500 border-green-500 text-black" : "border-gray-600 text-gray-600"}`}>
                            {s}
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 border border-green-900 rounded-xl p-8 shadow-2xl">
                    {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 flex items-center gap-2"><AlertTriangle size={18} />{error}</div>}

                    {step === 1 && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Step 1: Upload Malware</h2>
                            <p className="text-gray-400 mb-6">Upload the original executable (.exe) you want to test.</p>
                            <input type="file" onChange={(e) => setOriginalFile(e.target.files[0])} className="mb-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500" />
                            <button onClick={handleUploadOriginal} disabled={loading} className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold transition flex items-center gap-2 mx-auto">
                                {loading ? "Uploading..." : <span className="flex items-center gap-2">Next <ArrowRight size={18} /></span>}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Step 2: Choose Strategy</h2>
                            <p className="text-gray-400 mb-6">We analyzed your file. Based on its structure, we recommend:</p>

                            <div className="bg-green-900/20 border border-green-600 p-4 rounded-lg mb-6">
                                <span className="text-green-400 font-bold text-lg flex items-center gap-2">
                                    <CheckCircle size={20} /> Recommended: {recommendation}
                                </span>
                            </div>

                            <label className="block mb-2 text-gray-300">Select Perturbation:</label>
                            <select value={perturbation} onChange={(e) => setPerturbation(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 mb-6 text-white">
                                {availablePerturbations.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>

                            <button onClick={handleMutate} disabled={loading} className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-bold w-full flex justify-center items-center gap-2">
                                {loading ? "Applying Perturbation..." : <span className="flex items-center gap-2"><Play size={18} /> Apply Perturbation</span>}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-4">Step 3: Test in Sandbox</h2>
                            <div className="bg-gray-800/50 p-6 rounded-xl mb-6">
                                <p className="text-gray-300 mb-4">Your variant is ready. Download it and run it in your Sandbox (Cuckoo, Any.Run).</p>
                                <a href={`http://localhost:8000${variantUrl}`} download className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold text-white transition">
                                    <Download size={20} /> Download Variant
                                </a>
                            </div>

                            <div className="text-left bg-gray-900/50 p-4 rounded text-sm text-gray-400">
                                <p className="font-bold text-gray-200 mb-2">Instructions:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Run the ORIGINAL malware in your sandbox and export the report (Excel).</li>
                                    <li>Run the VARIANT malware in your sandbox and export the report (Excel).</li>
                                    <li>Note the detection rates (VirusTotal %) for both.</li>
                                </ul>
                            </div>

                            <button onClick={() => setStep(4)} className="mt-8 bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold">
                                I have the reports &rarr;
                            </button>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Step 4: Upload Analysis Data</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-red-400 mb-4">Original Malware</h3>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-1">Excel Report</label>
                                        <input type="file" onChange={(e) => setExcelOriginal(e.target.files[0])} accept=".xlsx, .xls" className="w-full text-sm text-gray-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Detection Rate (%)</label>
                                        <input type="number" value={rateOriginal} onChange={(e) => setRateOriginal(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 w-full" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-green-400 mb-4">Variant Malware</h3>
                                    <div className="mb-4">
                                        <label className="block text-sm text-gray-400 mb-1">Excel Report</label>
                                        <input type="file" onChange={(e) => setExcelVariant(e.target.files[0])} accept=".xlsx, .xls" className="w-full text-sm text-gray-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Detection Rate (%)</label>
                                        <input type="number" value={rateVariant} onChange={(e) => setRateVariant(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 w-full" />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleAnalyze} disabled={loading} className="mt-8 w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold">
                                {loading ? "Analyzing..." : "Calculate Fitness Score"}
                            </button>
                        </div>
                    )}

                    {step === 5 && finalReport && (
                        <div className="animate-fade-in">
                            <h2 className="text-3xl font-bold mb-6 text-center text-green-400">Analysis Results</h2>

                            <div className="grid md:grid-cols-3 gap-6 mb-8 text-center">
                                <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30">
                                    <p className="text-gray-400 text-sm uppercase tracking-wide">Fitness Score</p>
                                    <p className="text-4xl font-extrabold text-white mt-2">{finalReport.scores.fitness.toFixed(4)}</p>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <p className="text-gray-400 text-sm uppercase tracking-wide">Reduction</p>
                                    <p className="text-4xl font-bold text-green-400 mt-2">-{finalReport.scores.vt_reduction_percent.toFixed(1)}%</p>
                                </div>
                                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <p className="text-gray-400 text-sm uppercase tracking-wide">Similarity</p>
                                    <p className="text-4xl font-bold text-blue-400 mt-2">{finalReport.scores.ssdeep_distance}/100</p>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-xl">
                                <h3 className="font-bold text-lg mb-4">Functional Validation</h3>
                                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-2">
                                    <span>Functional Status:</span>
                                    <span className={finalReport.scores.is_functional ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                                        {finalReport.scores.is_functional ? "Functional (Pass)" : "Broken (Fail)"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Behavioral Overlap:</span>
                                    <span>{finalReport.similarity_percent.toFixed(1)}%</span>
                                </div>
                            </div>

                            <button onClick={() => window.location.reload()} className="mt-8 w-full border border-gray-600 hover:bg-gray-800 py-3 rounded-lg text-gray-400">
                                Start New Experiment
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
