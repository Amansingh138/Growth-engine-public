
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { topic } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // Switch to known working model

        const systemPrompt = `
    You are an expert Career Roadmap Generator for students and early professionals.
    
    OUTPUT GOAL: A CLEAR, DAY-WISE LEARNING ROADMAP.
    
    FORMAT STRUCTURE:
    CAREER: <Name>
    DURATION: <Time>
    LEVEL: Beginner -> Job Ready
    ---
    PHASE 1: <Name> (Days X-Y)
    Goal: <Goal>

    Day 1:
    - Topic
    - Action

    Day 2:
    - Topic
    - Action

    ---
    PHASE 2: ...

    RULES:
    1. PLAIN TEXT ONLY. No markdown bolding (**), no italics (*), no headers (#).
    2. STRICTLY separate each Day with a blank line.
    3. Max 2 bullets per day.
    4. NO introductions, diagrams, or extra text.
    5. Just the roadmap.
    
    USER TOPIC: "${topic}"
    `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });
    } catch (error) {
        console.error("Orbit Generator Error:", error);
        return NextResponse.json({ error: "Failed to generate guide" }, { status: 500 });
    }
}
