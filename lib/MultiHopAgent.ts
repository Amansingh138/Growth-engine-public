import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AgentResult {
    synthesis: string;
    sources: {
        type: "notebook" | "web";
        title: string;
        url?: string;
        snippet: string;
    }[];
}

export class MultiHopAgent {

    async execute(userId: string, question: string, notebookId?: string): Promise<AgentResult> {
        console.log(`[MultiHopAgent] Executing for User ${userId}. Notebook: ${notebookId || "None"}. Query: "${question}"`);
        const supabase = await createClient();

        // 1. Gather Context (Internal Sources)
        let internalSources: any[] = [];
        if (notebookId) {
            const { data } = await supabase.from("sources").select("*").eq("notebook_id", notebookId);
            if (data) {
                internalSources = data.map(s => ({
                    title: s.title,
                    url: s.content.startsWith("http") ? s.content : undefined,
                    snippet: s.content // For text sources, this is the content. For URL, we ideally scrape it.
                }));
            }
        }

        // 2. Perform Web Search (External Sources)
        // If a notebook is selected, we STRICTLY use only that notebook and disable web search.
        let webData: any[] = [];
        if (!notebookId) {
            webData = await this.performWebSearch(question);
        } else {
            console.log("Notebook selected. Skipping Web Search to focus on internal context.");
        }

        // 3. Synthesis with Google Gemini
        return this.synthesize(internalSources, webData, question);
    }

    private async performWebSearch(query: string) {
        const apiKey = process.env.TAVILY_API_KEY;
        if (!apiKey) {
            console.warn("No TAVILY_API_KEY found. Falling back to mock data.");
            return [
                { title: "Mock Source: Future Trends", url: "https://example.com", snippet: "Continuous learning is the key currency." },
            ];
        }

        try {
            const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    query: query,
                    search_depth: "advanced",
                    include_answer: true,
                    max_results: 5
                })
            });

            const data = await response.json();
            return data.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                snippet: r.content
            }));

        } catch (error) {
            console.error("Tavily Search Error:", error);
            return [];
        }
    }


    private async synthesize(internalSources: any[], webData: any[], question: string): Promise<AgentResult> {
        const allSources = [
            ...internalSources.map(s => ({ type: "notebook" as const, title: s.title, url: s.url, snippet: s.snippet })),
            ...webData.map(w => ({ type: "web" as const, title: w.title, url: w.url, snippet: w.snippet })),
        ];

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return {
                synthesis: "### ⚠️ Configuration Error\n\nGoogle API Key is missing. Please add `GOOGLE_API_KEY` to your environment variables.",
                sources: allSources
            };
        }

        try {
            const internalContext = internalSources.map(s => `SOURCE (User Notebook): ${s.title}\nCONTENT: ${s.snippet}`).join("\n\n");
            const webContext = webData.map(w => `SOURCE (Web - ${w.title}): ${w.snippet}`).join("\n\n");

            const systemPrompt = `
You are an educational AI assistant for a student learning platform.

Your primary goal is to provide CLEAR, CLEAN, and STRUCTURED answers.

STRICT OUTPUT RULES (MANDATORY):

1. Follow EXACTLY what the user asks.
   - If the user asks for "5 bullet points", give ONLY 5 bullet points.
   - Do NOT add introductions, summaries, disclaimers, or explanations unless explicitly asked.

2. FORMAT RULES:
   - Use simple bullet points (• or -) unless the user asks for headings or steps.
   - Each bullet point must be 1–2 lines maximum.
   - No markdown headings (###), no separators (***), no emojis.
   - No bold text unless explicitly requested.

3. CONTENT RULES:
   - Do NOT mention:
     - research agents
     - internal reasoning
     - sources
     - web results
     - notebooks
     - platforms
     - model names
   - Do NOT include citations or references.
   - Do NOT include warnings unless health/safety is directly asked.

4. LANGUAGE RULES:
   - Use simple, student-friendly English.
   - Be direct and practical.
   - Avoid complex medical or scientific jargon unless requested.

5. DEFAULT RESPONSE STYLE:
   - Short
   - Neutral
   - Clean
   - Easy to scan

6. IF THE USER REQUEST IS AMBIGUOUS:
   - Make a reasonable assumption
   - Do NOT ask follow-up questions unless absolutely necessary

7. NEVER exceed what the user asked.
   - No extra sections
   - No additional tips
   - No conclusions
`;

            const prompt = `
${systemPrompt}

### CONTEXT INFORMATION (Use to answer, but DO NOT cite or mention):
${internalContext ? "INTERNAL KNOWLEDGE:\n" + internalContext : ""}
WEB KNOWLEDGE:\n${webContext}

USER QUESTION: "${question}"

ANSWER:
`;

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Verified working model

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                synthesis: text,
                sources: allSources
            };

        } catch (error: any) {
            console.error("Gemini Generation Error:", error);
            let errorMessage = error.message || "Unknown error";

            return {
                synthesis: `### ❌ Synthesis Error\n\nI encountered an error while analyzing the data: ${errorMessage}. \n\nPlease try again later.`,
                sources: allSources
            };
        }
    }
}
