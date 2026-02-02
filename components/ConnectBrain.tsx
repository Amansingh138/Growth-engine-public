"use client";

import { useState } from "react";
import { Link2, CheckCircle2, AlertCircle } from "lucide-react";

export function ConnectBrain() {
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "connected" | "error">("idle");

    const handleConnect = async () => {
        if (!url.includes("notebooklm.google.com")) {
            setStatus("error");
            return;
        }
        setStatus("saving");

        // Simulate API call to save to Supabase
        setTimeout(() => {
            setStatus("connected");
        }, 1000);
    };

    return (
        <div className="p-6 bg-[#141416] border border-[#232325] rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Connect Your Brain</h3>
            <p className="text-sm text-gray-400 mb-6">
                Paste your NotebookLM URL to enable the AI agent to access your study materials.
            </p>

            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-3 text-gray-500">
                        <Link2 size={18} />
                    </div>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://notebooklm.google.com/notebook/..."
                        className="w-full bg-[#0a0a0a] border border-[#232325] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--primary)] transition-all"
                    />
                </div>
                <button
                    onClick={handleConnect}
                    className="px-6 py-2.5 bg-[var(--primary)] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                    {status === "saving" ? "Connecting..." : "Connect"}
                </button>
            </div>

            {status === "error" && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>Invalid URL. Must be a Google NotebookLM link.</span>
                </div>
            )}

            {status === "connected" && (
                <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 size={16} />
                    <span>Brain Connected Successfully!</span>
                </div>
            )}
        </div>
    );
}
