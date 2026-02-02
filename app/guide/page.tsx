"use client";

import { createClient } from "@/utils/supabase/client";
import { Sparkles, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateGuide() {
    // client-side auth check or allow public for now, but usually we want auth.
    // Since this is a client component, we rely on middleware or checking user in layout, 
    // or we can use a server component wrapper. 
    // For simplicity in this edit, I will make it a standard client interactive page.

    const [topic, setTopic] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch("/api/guide/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic }),
            });

            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            if (data.result) {
                setResult(data.result);
            } else {
                throw new Error("No result received from AI");
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto min-h-screen">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
            </Link>

            <header className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                    Orbit Roadmap Builder
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Your personal learning assistant. Enter any skill or topic, and I will design a structural learning roadmap for you.
                </p>
            </header>

            {/* Input Section */}
            <div className="bg-[#141416] border border-[#232325] rounded-3xl p-2 flex items-center max-w-2xl mx-auto shadow-2xl shadow-purple-900/10">
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="What do you want to learn? (e.g. Data Science, Pottery_)"
                    className="flex-1 bg-transparent border-none outline-none text-white px-6 py-4 placeholder-gray-600 focus:ring-0"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading || !topic}
                    className={`p-4 rounded-2xl transition-all ${loading ? 'bg-gray-800 cursor-wait' : 'bg-white hover:bg-gray-200 text-black'}`}
                >
                    {loading ? <Sparkles className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center">
                    {error}
                </div>
            )}

            {/* Result Section */}
            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Text Content */}
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-[#141416]/50 border border-[#232325] rounded-3xl p-8 whitespace-pre-wrap font-mono text-sm text-gray-300 shadow-inner">
                            {result}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
