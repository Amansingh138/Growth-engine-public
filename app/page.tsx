import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Sparkles, BookOpen, Search, GraduationCap } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: recentChats } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user.user_metadata.full_name || "Learning"}</span>
          </h1>
          <p className="text-gray-400 mt-2">Ready to grow your knowledge today?</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#141416] border border-[#232325] rounded-full text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Brain Online
        </div>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/chat" className="block">
          <div className="p-6 bg-[#141416] border border-[#232325] rounded-3xl hover:border-[var(--primary)] transition-colors cursor-pointer group h-full">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Search className="text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Ask Anything</h3>
            <p className="text-sm text-gray-500 mt-2">Deep research your questions using web sources.</p>
          </div>
        </Link>

        <Link href="/guide" className="block">
          <div className="p-6 bg-[#141416] border border-[#232325] rounded-3xl hover:border-[var(--secondary)] transition-colors cursor-pointer group h-full">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Orbit Roadmap</h3>
            <p className="text-sm text-gray-500 mt-2">Design visual learning paths with AI.</p>
          </div>
        </Link>

        <Link href="/settings" className="block">
          <div className="p-6 bg-[#141416] border border-[#232325] rounded-3xl hover:border-orange-500/50 transition-colors cursor-pointer group h-full">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <GraduationCap className="text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white">My Knowledge</h3>
            <p className="text-sm text-gray-500 mt-2">Manage connected notebooks and resources.</p>
          </div>
        </Link>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4">Recent Learnings</h2>
        <div className="bg-[#141416] border border-[#232325] rounded-3xl p-1">
          {recentChats && recentChats.length > 0 ? (
            recentChats.map((chat: any, index: number) => (
              <div
                key={chat.id}
                className={`p-4 hover:bg-[#1f1f22] rounded-2xl transition-colors cursor-pointer flex justify-between items-center group ${index !== 0 ? 'border-t border-[#232325]' : ''}`}
              >
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[var(--primary)] line-clamp-1">{chat.question}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Sourced from: {chat.source_type === 'notebook' ? 'Private Notebook' : 'Web Search'} • {new Date(chat.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Search size={16} className="text-gray-600 group-hover:text-white" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              No recent learnings yet. Start asking questions!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
