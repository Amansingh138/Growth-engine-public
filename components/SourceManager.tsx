"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Link2, FileText, Plus, Trash2 } from "lucide-react";
import { Database } from "@/types/supabase";

type Source = Database["public"]["Tables"]["sources"]["Row"];

export function SourceManager({ notebookId }: { notebookId: string }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchSources();
  }, [notebookId]);

  const fetchSources = async () => {
    const { data } = await supabase.from("sources").select("*").eq("notebook_id", notebookId).order("created_at", { ascending: false });
    if (data) setSources(data);
  };

  const addSource = async () => {
    if (!urlInput.trim()) return;
    const { data } = await supabase.from("sources").insert({
      notebook_id: notebookId,
      title: urlInput, // Uses URL as title for now
      type: "url",
      content: urlInput
    }).select().single();

    if (data) {
      setSources([data, ...sources]);
      setUrlInput("");
    }
  };

  const deleteSource = async (id: string) => {
    await supabase.from("sources").delete().eq("id", id);
    setSources(sources.filter(s => s.id !== id));
  };

  return (
    <div className="bg-[#141416] border border-[#232325] rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Link2 size={18} className="text-[var(--primary)]" />
        Notebook Sources
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste URL (e.g., https://react.dev)"
          className="flex-1 bg-[#0a0a0a] border border-[#232325] rounded-xl px-4 py-2 text-white text-sm focus:border-[var(--primary)] outline-none"
        />
        <button
          onClick={addSource}
          disabled={!urlInput.trim()}
          className="bg-[var(--primary)] text-black rounded-xl px-4 py-2 hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {sources.map(s => (
          <div key={s.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-[#232325] group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 bg-blue-500/10 rounded px-1.5 py-1 text-blue-400 flex items-center justify-center shrink-0">
                {s.type === 'url' ? <Link2 size={14} /> : <FileText size={14} />}
              </div>
              <span className="text-sm text-gray-300 truncate">{s.title}</span>
            </div>
            <button
              onClick={() => deleteSource(s.id)}
              className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {sources.length === 0 && (
          <p className="text-gray-600 text-center text-sm py-4 italic">No sources yet. Add a URL to start.</p>
        )}
      </div>
    </div>
  );
}
