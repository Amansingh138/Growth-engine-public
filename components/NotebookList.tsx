"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Book, Plus, ExternalLink, Trash2 } from "lucide-react";
import { Database } from "@/types/supabase";

type Notebook = Database["public"]["Tables"]["notebooks"]["Row"];

export function NotebookList({ onSelect }: { onSelect?: (notebook: Notebook) => void }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNotebookName, setNewNotebookName] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    const { data } = await supabase.from("notebooks").select("*").order("created_at", { ascending: false });
    if (data) setNotebooks(data);
    setLoading(false);
  };

  const createNotebook = async () => {
    if (!newNotebookName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      const { data, error } = await supabase.from("notebooks").insert({
        name: newNotebookName,
        user_id: user.id
      }).select().single();

      if (error) throw error;

      if (data) {
        setNotebooks([data, ...notebooks]);
        setNewNotebookName("");
      }
    } catch (e: any) {
      console.error("Error creating notebook:", e);
      alert(`Failed to create notebook: ${e.message || e}`);
    }
  };

  const deleteNotebook = async (id: string) => {
    await supabase.from("notebooks").delete().eq("id", id);
    setNotebooks(notebooks.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          value={newNotebookName}
          onChange={(e) => setNewNotebookName(e.target.value)}
          placeholder="New Notebook Name (e.g., 'React Learning')"
          className="flex-1 bg-[#141416] border border-[#232325] rounded-xl px-4 py-2 text-white focus:border-[var(--primary)] outline-none"
        />
        <button
          onClick={createNotebook}
          disabled={!newNotebookName.trim()}
          className="bg-[var(--primary)] text-black rounded-xl px-4 py-2 hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notebooks.map((n) => (
          <div
            key={n.id}
            onClick={() => onSelect?.(n)}
            className="group relative p-6 bg-[#141416] border border-[#232325] rounded-2xl hover:border-[var(--primary)] transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                <Book size={20} />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotebook(n.id); }}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="font-bold text-white text-lg group-hover:text-[var(--primary)] transition-colors">{n.name}</h3>
            <p className="text-gray-500 text-sm mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
