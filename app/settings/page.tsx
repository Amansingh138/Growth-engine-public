"use client";
import { NotebookList } from "@/components/NotebookList";
import { SourceManager } from "@/components/SourceManager";
import { useState } from "react";
import { Database } from "@/types/supabase";
import { ArrowLeft } from "lucide-react";

type Notebook = Database["public"]["Tables"]["notebooks"]["Row"];

export default function LibraryPage() {
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(null);

  return (
    <div className="p-8 space-y-8">
      <header>
        {selectedNotebook ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedNotebook(null)}
              className="p-2 hover:bg-[#141416] rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedNotebook.name}</h1>
              <p className="text-gray-400">Manage sources for this notebook.</p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-white">My Library</h1>
            <p className="text-gray-400">Create notebooks and add sources to create your personal learning engine.</p>
          </div>
        )}
      </header>

      {selectedNotebook ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SourceManager notebookId={selectedNotebook.id} />
          </div>
          <div className="lg:col-span-2 bg-[#141416] border border-[#232325] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-transparent rounded-full flex items-center justify-center opacity-50">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-xl font-bold text-white">Ready to Learn</h3>
            <p className="text-gray-400 max-w-md">
              Go to the Chat to ask questions using these sources.
              <br />
              The Agent will assume context from <b>{selectedNotebook.name}</b>.
            </p>
          </div>
        </div>
      ) : (
        <NotebookList onSelect={setSelectedNotebook} />
      )}
    </div>
  );
}
