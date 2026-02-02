import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata = {
  title: "Growth Engine",
  description: "Your Open Source AI Learning Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex h-screen bg-[#0a0a0a] text-[#ededed] overflow-hidden">
        {/* We can conditionally render Sidebar based on auth state if needed, 
            but for now we'll wrap content in a layout that checks auth or 
            let the Sidebar be present and handle redirect in middleware */}
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
