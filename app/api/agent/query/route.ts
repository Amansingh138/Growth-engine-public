import { createClient } from "@/utils/supabase/server";
import { MultiHopAgent } from "@/lib/MultiHopAgent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { question, notebookId } = await request.json();

        // 2. Fetch User's Notebook URL (Legacy/Mock) - We now use internal notebooks
        // const notebookUrl = "https://notebooklm.google.com/notebook/mock-id";

        // 3. Execute Multi-Hop Agent
        const agent = new MultiHopAgent();
        const result = await agent.execute(user.id, question, notebookId);

        // 4. Log Chat History
        const insertData = {
            user_id: user.id,
            question: question,
            answer: result.synthesis,
            source_type: notebookId ? "notebook" : "web",
            notebook_id: notebookId || null
        };

        const { error: logError } = await supabase.from("chats").insert(insertData);
        if (logError) {
            console.error("Failed to log chat:", logError);
            // Non-blocking error, we still return result
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("Agent Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
