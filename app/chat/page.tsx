"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Book, ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/supabase";

type Notebook = Database["public"]["Tables"]["notebooks"]["Row"];

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; snippet?: string; url?: string; type: "notebook" | "web" }[];
  webSourcesSaved?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Growth Engine. Select a notebook below to provide context, or just ask away!" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotebooks = async () => {
      const { data } = await supabase.from("notebooks").select("*").order("created_at", { ascending: false });
      if (data) setNotebooks(data);
    };
    fetchNotebooks();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveSourcesToNotebook = async (msgIndex: number, sources: NonNullable<Message["sources"]>, notebookId: string) => {
    const webSources = sources.filter(s => s.type === "web");
    if (webSources.length === 0) return;

    try {
      const { error } = await supabase.from("sources").insert(
        webSources.map(s => ({
          notebook_id: notebookId,
          title: s.title,
          type: 'url',
          content: s.url || s.snippet
        }))
      );

      if (error) throw error;
      alert("Sources saved to notebook successfully! 📚");

      // Hide the web sources for this message
      setMessages(prev => prev.map((m, i) =>
        i === msgIndex ? { ...m, webSourcesSaved: true } : m
      ));

    } catch (err) {
      console.error("Failed to save sources:", err);
      alert("Failed to save sources. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          notebookId: activeNotebookId
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to fetch");

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.synthesis,
        sources: data.sources
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <div className="p-6 border-b border-[#232325]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Ask the Brain</h1>
            <p className="text-sm text-gray-500">Deep Research Agent</p>
          </div>

          <select
            value={activeNotebookId || ""}
            onChange={(e) => setActiveNotebookId(e.target.value || null)}
            className="bg-[#141416] border border-[#232325] text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[var(--primary)]"
          >
            <option value="">No Context (Web Only)</option>
            {notebooks.map(n => (
              <option key={n.id} value={n.id}>📚 {n.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={clsx("flex gap-4 max-w-3xl mx-auto", msg.role === "user" ? "flex-row-reverse" : "")}>
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === "assistant" ? "bg-[var(--primary)] text-black" : "bg-[#232325] text-white"
            )}>
              {msg.role === "assistant" ? <Bot size={18} /> : <User size={18} />}
            </div>

            <div className={clsx(
              "rounded-2xl p-4 max-w-[80%]",
              msg.role === "assistant" ? "bg-[#1f1f22] text-gray-200" : "bg-[var(--primary)] text-black font-medium"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4">

                  {msg.sources.some(s => s.type === "notebook") && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                        <Book size={12} className="text-green-400" />
                        From Your Notebook:
                      </p>
                      <div className="grid gap-2">
                        {msg.sources.filter(s => s.type === "notebook").map((source, sIdx) => (
                          <div key={sIdx} className="bg-green-900/10 p-2 rounded-lg text-sm border border-green-500/20 hover:border-green-500/40 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-green-500/20 text-green-400">
                                Notebook
                              </span>
                              <span className="font-semibold truncate text-green-100">{source.title}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 italic">"{source.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hide web sources if they were saved */}
                  {msg.sources.some(s => s.type === "web") && !msg.webSourcesSaved && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                          <ExternalLink size={12} className="text-blue-400" />
                          From The Web:
                        </p>
                        <button
                          onClick={() => {
                            if (!activeNotebookId) {
                              alert("Please select a notebook from the top menu to save these sources! 👆");
                              return;
                            }
                            saveSourcesToNotebook(idx, msg.sources!, activeNotebookId);
                          }}
                          className={clsx(
                            "text-xs px-2 py-1 rounded transition-colors flex items-center gap-1",
                            activeNotebookId
                              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                          )}
                        >
                          <Book size={12} />
                          {activeNotebookId ? "Save to Notebook" : "Select Notebook to Save"}
                        </button>
                      </div>
                      <div className="grid gap-2">
                        {msg.sources.filter(s => s.type === "web").map((source, sIdx) => (
                          <div key={sIdx} className="bg-blue-900/10 p-2 rounded-lg text-sm border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-blue-500/20 text-blue-400">
                                Web
                              </span>
                              <a href={source.url || "#"} target="_blank" className="font-semibold truncate hover:underline text-blue-100">{source.title}</a>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 italic">"{source.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optional: Show a small indicator that sources were saved */}
                  {msg.webSourcesSaved && (
                    <div className="text-xs text-green-500 italic opacity-60 flex items-center gap-1">
                      <Book size={10} /> Sources saved to notebook
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-black flex items-center justify-center animate-pulse">
              <Bot size={18} />
            </div>
            <div className="bg-[#1f1f22] rounded-2xl p-4 flex items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" size={16} />
              <span>Analyzing {activeNotebookId ? "Notebook & Web" : "Web Sources"}...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-[#232325] bg-[#0a0a0a]">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${activeNotebookId ? "your selected notebook..." : "anything..."}`}
            className="w-full bg-[#141416] border border-[#232325] rounded-2xl pl-6 pr-14 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-3 p-2 bg-[var(--primary)] text-black rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
