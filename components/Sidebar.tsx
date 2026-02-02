"use client";

import {
    LayoutDashboard,
    Settings,
    BrainCircuit,
    LogOut,
    Zap,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const MENU_ITEMS = [
    { name: "My Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Brain Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    return (
        <aside className="w-64 h-screen bg-[#0d0d0f] border-r border-[#232325] flex flex-col sticky top-0">
            {/* Brand */}
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-lg flex items-center justify-center">
                    <BrainCircuit className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Growth Engine
                </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-[#1f1f22] text-[var(--primary)] shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-[#1f1f22]"
                            )}
                        >
                            <item.icon
                                size={18}
                                className={clsx(
                                    "transition-colors",
                                    isActive ? "text-[var(--primary)]" : "text-gray-500 group-hover:text-white"
                                )}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User / Logout */}
            <div className="p-4 border-t border-[#232325]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-[#1f1f22] transition-colors text-gray-400 hover:text-white"
                >
                    <LogOut size={18} />
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
